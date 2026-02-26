# media-patch.py — PPTX cover slide에 video+audio를 OOXML 패치로 임베딩
# 사용법: python media-patch.py <pptx_path> <spec_path>

import sys
import os
import re
import zipfile


# ─── spec 파싱 ───────────────────────────────────────────────────────────────

def parse_media_spec(spec_path):
    """slides-spec.md의 slide-01 media 블록에서 video/audio 경로 dict 반환."""
    try:
        text = open(spec_path, encoding='utf-8').read()
    except FileNotFoundError:
        print(f"[media-patch] WARNING: spec not found: {spec_path}")
        return None

    m = re.search(r'### slide-01\s*\n(.*?)(?=\n### slide-\d+|\Z)', text, re.DOTALL)
    if not m:
        print("[media-patch] slide-01 섹션 없음. 패치 스킵.")
        return None

    mm = re.search(r'\*\*media\*\*(.*?)(?=\n\s*-\s*\*\*|\Z)', m.group(1), re.DOTALL)
    if not mm:
        print("[media-patch] slide-01 media 블록 없음. 패치 스킵.")
        return None

    t = mm.group(0)
    result = {}
    vp = re.search(r'video:.*?path:\s*["\']?([^"\'\n]+)["\']?', t, re.DOTALL)
    ap = re.search(r'audio:.*?path:\s*["\']?([^"\'\n]+)["\']?', t, re.DOTALL)
    if vp:
        result['video'] = vp.group(1).strip()
    if ap:
        result['audio'] = ap.group(1).strip()
    return result or None


# ─── Content_Types.xml 패치 ───────────────────────────────────────────────────

def patch_content_types(xml, has_vid, has_aud):
    """mp4/mp3 Default MIME 항목 추가."""
    if has_vid and 'Extension="mp4"' not in xml:
        xml = xml.replace('</Types>',
                          '  <Default Extension="mp4" ContentType="video/mp4"/>\n</Types>')
    if has_aud and 'Extension="mp3"' not in xml:
        xml = xml.replace('</Types>',
                          '  <Default Extension="mp3" ContentType="audio/mpeg"/>\n</Types>')
    return xml


# ─── slide1.xml.rels 패치 ─────────────────────────────────────────────────────

def patch_rels(xml, rv, ra, vf, af, has_vid, has_aud):
    """video/audio 관계(Relationship) 항목 추가."""
    ins = ''
    if has_vid:
        ins += (f'  <Relationship Id="{rv}" '
                f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video" '
                f'Target="../media/{vf}"/>\n')
    if has_aud:
        ins += (f'  <Relationship Id="{ra}" '
                f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" '
                f'Target="../media/{af}"/>\n')
    return xml.replace('</Relationships>', ins + '</Relationships>') if ins else xml


# ─── OOXML shape XML 생성 ──────────────────────────────────────────────────────

def build_shapes(vid_id, aud_id, rv, ra, has_vid, has_aud):
    """video(전체화면) + audio(숨김) p:pic shape XML 반환."""
    out = ''
    if has_vid:
        out += (
            f'<p:pic>'
            f'<p:nvPicPr>'
            f'<p:cNvPr id="{vid_id}" name="CoverVideo"/>'
            f'<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>'
            f'<p:nvPr><p:videoFile r:link="{rv}" contentType="video/mp4"/></p:nvPr>'
            f'</p:nvPicPr>'
            f'<p:blipFill><a:blip/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
            f'<p:spPr>'
            f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="5143500"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
            f'</p:spPr></p:pic>\n'
        )
    if has_aud:
        out += (
            f'<p:pic>'
            f'<p:nvPicPr>'
            f'<p:cNvPr id="{aud_id}" name="CoverAudio"/>'
            f'<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>'
            f'<p:nvPr><p:audioFile r:link="{ra}" contentType="audio/mpeg"/></p:nvPr>'
            f'</p:nvPicPr>'
            f'<p:blipFill><a:blip/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
            f'<p:spPr>'
            f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="457200" cy="457200"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
            f'</p:spPr></p:pic>\n'
        )
    return out


# ─── OOXML timing XML 생성 ───────────────────────────────────────────────────

def build_timing(vid_id, aud_id, has_vid, has_aud):
    """슬라이드 진입 즉시 autoplay + loop + 동시시작 타이밍 XML 반환."""
    media = ''
    if has_vid:
        media += (
            f'<p:par><p:cTn id="5" fill="hold" dur="indefin" repeatDur="indefin">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
            f'<p:childTnLst><p:video>'
            f'<p:cMediaNode restart="never" fill="hold" showWhenStopped="0">'
            f'<p:cTn id="6" dur="indefin" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{vid_id}"/></p:tgtEl>'
            f'</p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par>\n'
        )
    if has_aud:
        media += (
            f'<p:par><p:cTn id="7" fill="hold" dur="indefin" repeatDur="indefin">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
            f'<p:childTnLst><p:audio>'
            f'<p:cMediaNode restart="never" fill="hold" showWhenStopped="0">'
            f'<p:cTn id="8" dur="indefin" fill="hold"/>'
            f'<p:tgtEl><p:spTgt spid="{aud_id}"/></p:tgtEl>'
            f'</p:cMediaNode></p:audio></p:childTnLst></p:cTn></p:par>\n'
        )
    return (
        '<p:timing>'
        '<p:tnLst><p:par>'
        '<p:cTn id="1" dur="indefin" restart="whenNotActive" nodeType="tmRoot">'
        '<p:childTnLst>'
        '<p:seq concurrent="1" nextAc="seek">'
        '<p:cTn id="2" dur="indefin" nodeType="mainSeq">'
        '<p:childTnLst><p:par>'
        '<p:cTn id="3" fill="hold">'
        '<p:stCondLst><p:cond delay="indefin"/></p:stCondLst>'
        '<p:childTnLst><p:par>'
        '<p:cTn id="4" fill="hold">'
        '<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
        f'<p:childTnLst>{media}</p:childTnLst>'
        '</p:cTn></p:par></p:childTnLst>'
        '</p:cTn></p:par></p:childTnLst>'
        '</p:cTn>'
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tn/></p:cond></p:prevCondLst>'
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tn/></p:cond></p:nextCondLst>'
        '</p:seq>'
        '</p:childTnLst></p:cTn>'
        '</p:par></p:tnLst>'
        '<p:bldLst/></p:timing>'
    )


# ─── slide1.xml 패치 ─────────────────────────────────────────────────────────

def patch_slide_xml(xml, vid_id, aud_id, rv, ra, has_vid, has_aud):
    """shapes를 </p:spTree> 앞에, timing을 </p:sld> 앞에 삽입."""
    shapes = build_shapes(vid_id, aud_id, rv, ra, has_vid, has_aud)
    if shapes:
        xml = xml.replace('</p:spTree>', shapes + '</p:spTree>')

    timing = build_timing(vid_id, aud_id, has_vid, has_aud)
    if '<p:timing' in xml:
        xml = re.sub(r'<p:timing[\s\S]*?</p:timing>', timing, xml)
    else:
        xml = xml.replace('</p:sld>', timing + '</p:sld>')
    return xml


# ─── 메인 패치 ───────────────────────────────────────────────────────────────

def patch_pptx(pptx_path, spec, base_dir):
    """PPTX ZIP을 열어 OOXML 패치 후 원본 덮어쓰기."""
    def resolve(p):
        return p if os.path.isabs(p) else os.path.join(base_dir, p)

    vpath = resolve(spec['video']) if 'video' in spec else None
    apath = resolve(spec['audio']) if 'audio' in spec else None
    has_vid = bool(vpath and os.path.exists(vpath))
    has_aud = bool(apath and os.path.exists(apath))

    if vpath and not has_vid:
        print(f"[media-patch] WARNING: video not found: {vpath}")
    if apath and not has_aud:
        print(f"[media-patch] WARNING: audio not found: {apath}")
    if not has_vid and not has_aud:
        print("[media-patch] Nothing to patch.")
        return

    print(f"[media-patch] 미디어 패치 시작... (video={has_vid}, audio={has_aud})")
    vf = os.path.basename(vpath) if has_vid else None
    af = os.path.basename(apath) if has_aud else None

    tmp = pptx_path + '.tmp'
    slide_xml = rels_xml = ct_xml = None

    with zipfile.ZipFile(pptx_path, 'r') as zin:
        with zipfile.ZipFile(tmp, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == 'ppt/slides/slide1.xml':
                    slide_xml = data.decode('utf-8')
                elif item.filename == 'ppt/slides/_rels/slide1.xml.rels':
                    rels_xml = data.decode('utf-8')
                elif item.filename == '[Content_Types].xml':
                    ct_xml = data.decode('utf-8')
                else:
                    zout.writestr(item, data)

            if not slide_xml or not ct_xml:
                print("[media-patch] ERROR: 필수 ZIP 항목 누락.")
                return
            if not rels_xml:
                rels_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                            '<Relationships xmlns="http://schemas.openxmlformats.org/'
                            'package/2006/relationships"></Relationships>')

            # ID 결정
            shape_ids = [int(x) for x in re.findall(r'\bid="(\d+)"', slide_xml)]
            max_sid = max(shape_ids) if shape_ids else 10
            vid_id, aud_id = max_sid + 1, max_sid + 2

            rids = [int(x) for x in re.findall(r'Id="rId(\d+)"', rels_xml)]
            max_rid = max(rids) if rids else 0
            rv, ra = f"rId{max_rid + 1}", f"rId{max_rid + 2}"

            # 패치
            slide_xml = patch_slide_xml(slide_xml, vid_id, aud_id, rv, ra, has_vid, has_aud)
            rels_xml  = patch_rels(rels_xml, rv, ra, vf, af, has_vid, has_aud)
            ct_xml    = patch_content_types(ct_xml, has_vid, has_aud)

            zout.writestr('ppt/slides/slide1.xml',         slide_xml.encode('utf-8'))
            zout.writestr('ppt/slides/_rels/slide1.xml.rels', rels_xml.encode('utf-8'))
            zout.writestr('[Content_Types].xml',           ct_xml.encode('utf-8'))

            if has_vid:
                zout.writestr(f'ppt/media/{vf}', open(vpath, 'rb').read())
            if has_aud:
                zout.writestr(f'ppt/media/{af}', open(apath, 'rb').read())

    os.replace(tmp, pptx_path)
    print(f"[media-patch] Patched successfully: {pptx_path}")


# ─── 엔트리포인트 ─────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print(f"Usage: python {sys.argv[0]} <pptx_path> <spec_path>")
        sys.exit(1)

    pptx_path, spec_path = sys.argv[1], sys.argv[2]
    if not os.path.exists(pptx_path):
        print(f"[media-patch] ERROR: PPTX not found: {pptx_path}")
        sys.exit(1)

    # spec_path = ".../output/slides-spec.md" → base_dir = 프로젝트 루트
    # "output/assets/cover-video.mp4" 같은 프로젝트 상대 경로를 올바르게 해석
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(spec_path)))
    spec = parse_media_spec(spec_path)
    if spec is None:
        sys.exit(0)

    try:
        patch_pptx(pptx_path, spec, base_dir)
    except Exception as e:
        print(f"[media-patch] ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
