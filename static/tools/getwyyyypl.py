#
r"""将网易云音乐的一些播放列表转换为apl播放列表
"""

import json,time
import requests

type pllist=list[dict[str,str|int]]
"播放列表条目"
type playlist=dict[str,str|pllist]
"播放列表"
type errstr=str
"表明返回的是错误提示"

headers={
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
    "Dnt":"1",
    "Accept":"application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8",
}
dft_meta={
    "source":"w4y",
    "program":"getwyyyypl.py",
    "ctime":int(time.time()),
}

def get_data(pathname:str)->dict[str,int|str|dict]:
    """获取数据"""
    r=requests.get("https://music.163.com/"+pathname,headers=headers)
    if r.status_code!=200:
        return
    fk=r.cookies.get("NMTID")
    if fk:
        print(f"风控用Cookie: NMTID={fk}")
    return r.json()

def paclists(d:list)->pllist:
    r=[]
    for a in d:
        ar=""
        art=a["artists"]
        ari=0
        for ars in art:
            ar+=ars["name"]
            ari+=1
            if ari<len(art):
                ar+="/"
        r.append({
            "title":f"{a['name']} - {ar}",
            "call":"get163",
            "value":a["id"],
        })
    return r

def get_album(id:int)->playlist|errstr:
    d=get_data("api/album/"+str(id))
    if d["code"]!=200:
        return d["message"]
    return {
        "title":d["album"]["name"],
        "depend":["au_call.json"],
        "meta":dft_meta|{
            "album_id":id,
        },
        "list":paclists(d["album"]["songs"])
    }

def get_playlist(id:int)->playlist|errstr:
    d=get_data("api/playlist/detail?id="+str(id))
    if d["code"]!=200:
        return d["message"]
    return {
        "title":d["result"]["name"],
        "depend":["au_call.json"],
        "meta":dft_meta|{
            "playlist_id":id,
        },
        "list":paclists(d["result"]["tracks"])
    }

def save_file(obj:playlist,name:str="playlist.apl.json")->None:
    with open(name,"wt",encoding="utf_8",newline="\n")as f:
        json.dump(obj,f,indent="\t",ensure_ascii=False)

def main():
    import argparse
    p=argparse.ArgumentParser(
        description="网易云音乐播放列表转换\n使用Cookie可以在一定程度下防止风控，特别是出现风控用Cookie信息的时候。出现时建议复制后面跟随的Cookie文本，在下一次请求中提供。\n部分接口必须要已登录的Cookie才能获取完整信息。",
        epilog="示例：\n album [专辑ID]\n playlist [播放列表ID]",
        formatter_class=argparse.RawTextHelpFormatter
    )
    p.add_argument("type",help="类别",choices=["album","playlist"])
    p.add_argument("id",help="该处理类别所需要的ID",type=int)
    p.add_argument("-n","--file-name",help="指定保存的文件名",default="playlist.apl.json")
    p.add_argument("-c","--cookie",help="使用cookie，防止风控")
    a=p.parse_args()
    i=a.id
    d=None
    if a.cookie:
        headers["Cookie"]=a.cookie
    match a.type:
        case "album":
            d=get_album(i)
        case "playlist":
            d=get_playlist(i)
    if d is None:
        raise SystemExit("类型不匹配")
    if isinstance(d,str):
        print("获取失败:",d)
        return
    save_file(d,a.file_name)
    print("文件已写出")

main()
