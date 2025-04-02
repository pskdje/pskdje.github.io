// 文件类型推断
/* 在浏览器上进行推断文件类型
 * 照着 https://github.com/sindresorhus/file-type 项目进行编写，将该项目的逻辑改为浏览器可直接使用。
 * MIT License
 */

import {
	Uint8ArrayReader as ZipU8ArrReader,
	Uint8ArrayWriter as ZipU8ArrWriter,
	TextWriter as ZipTextWriter,
	ZipReader
} from "./extern/zip.js.mjs";

export function check(buffer, bytes, options){// 依照给定的数据和参数，比较缓冲流
	const opt={
		offset:0,
		...options
	};
	for(const[index, byte]of bytes.entries()){
		if(opt.mask){
			if(byte !== (opt.mask[index] & buffer[index + opt.offset]))return false;
		}else if(byte !== buffer[index + opt.offset])return false;
	}
	return true;
}
export function stringToBytes(str){// 将字符串转换为16进制数据
	return [...str].map(char => char.charCodeAt(0));
}
export function generBuffer(arrBuffer){// 将缓冲数组转换为可读取的Unit8Array
	if(!(arrBuffer instanceof ArrayBuffer))throw new TypeError("输入的不是缓冲数组");
	return new Uint8Array(arrBuffer);
}
function prt(ext, mime, obj={}){// 按照一定的格式返回检测结果
	return{ext, mime, ...obj};
}

export class FileTypeParser {
	#buffer=undefined;
	get buffer(){return this.#buffer}
	set buffer(v){
		if(v instanceof Uint8Array) this.#buffer = v;
	}
	#arrayBuffer=null;
	get arrayBuffer(){return this.#arrayBuffer}
	set arrayBuffer(v){
		if(v instanceof ArrayBuffer) this.#arrayBuffer = v;
	}
	constructor(){};
	check(bytes, options){// 比较给出的16进制数据
		return check(this.buffer, bytes, options);
	}
	checkString(string, options){// 将字符串转换为16进制数据并比较
		return this.check(stringToBytes(string), options);
	}
	async parse(data){// 检测逻辑
		this.buffer=generBuffer(data);
		this.arrayBuffer=data;

		// 2字节

		if(this.check([0x42, 0x4D]))return prt("bmp", "image/bmp");
		if(this.check([0x0B, 0x77]))return prt("ac3", "audio/vnd.dolby.dd-raw");
		if(this.check([0x78, 0x01]))return prt("dmg", "application/x-apple-diskimage");
		if(this.check([0x4D, 0x5A]))return prt("exe", "application/x-msdownload");
		if(this.check([0x25, 0x21])){
			if(
				this.checkString("PS-Adobe-",{offset:2})
				&& this.checkString("EPSF-",{offset:14})
			)return prt("eps","application/eps");
			return prt("ps","application/postscript");
		}
		if(
			this.check([0x1F, 0xA0]) ||
			this.check([0x1F, 0x9D])
		)return prt("Z","application/x-compress");
		if(this.check([0xC7, 0x71]))return prt("cpio","application/x-cpio");
		if(this.check([0x60, 0xEA]))return prt("arj","application/x-arj");

		// 3字节

		// [0xEF, 0xBB, 0xBF] (UTF-8-BOM)
		if(this.check([0x47, 0x49, 0x46]))return prt("gif","image/gif");
		if(this.check([0x49, 0x49, 0xBC]))return prt("jxr","image/vnd.ms-photo");
		if(this.check([0x1F, 0x8B, 0x08]))return prt("gz","application/gzip");
		if(this.check([0x42, 0x5A, 0x68]))return prt("bz2","application/x-bzip2");
		if(this.checkString("ID3"))return prt("mp3","audio/mp3");
		if(this.checkString("MP+"))return prt("mpc","audio/x-mustpack");
		if(
			(this.buffer[0] === 0x43 || this.buffer[0] === 0x46)
			&& this.check([0x57, 0x53],{offset:1})
		)return prt("swf","application/x-shockwave-flash");
		if(this.checkString("FLV"))return prt("flv","video/x-flv");

		// 4字节

		if(this.check([0xFF, 0xD8, 0xFF])){
			if(this.check([0xF7],{offset:3}))return prt("jls","image/jls");
			return prt("jpg","image/jpeg");
		}
		if(this.check([0x4F, 0x62, 0x6A, 0x01]))return prt("avro","application/avro");
		if(this.checkString("FLIF"))return prt("flif","image/flif");
		if(this.checkString("8BPS"))return prt("psd","image/vnd.adobe.photoshop");
		if(this.checkString("MPCK"))return prt("mpc","audio/x-musepack");
		if(this.checkString("WEBP",{offset:8}))return prt("webp","image/webp");
		if(this.checkString("FORM"))return prt("aif","audio/aiff");
		if(this.checkString("icns"))return prt("icns","image/icns");
		// zip base format
		if(this.check([0x50, 0x4B, 0x03, 0x04])){
			const zip=new ZipReader(new ZipU8ArrReader(this.buffer));
			try{
				for await(const zi of zip.getEntriesGenerator()){
					switch(zi.filename){
						case "META-INF/mozilla.rsa":
							return prt("xpi","application/x-xpinstall");
						case "AndroidManifest.xml":
							return prt("apk","application/vnd.android.package-archive");
						case "META-INF/MANIFEST.MF":
							return prt("jar","application/java-archive");
					}
				}
			}finally{
				await zip.close();
			}// other
			return prt("zip","application/zip");
		}
		if(this.checkString("OggS")){
			const type = this.buffer.slice(28,36);
			if(check(type,[0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]))return prt("opus","audio/ogg; codecs=opus");
			if(check(type,[0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61]))return prt("ogv","video/ogg");
			if(check(type,[0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00]))return prt("ogm","video/ogg");
			if(check(type,[0x7F, 0x46, 0x4C, 0x41, 0x43]))return prt("oga","audio/ogg");
			if(check(type,[0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20]))return prt("spx","audio/ogg");
			if(check(type,[0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73]))return prt("ogg","audio/ogg");
			// Default
			return prt("ogx","application/ogg");
		}
		if(
			this.check([0x50, 0x4B])
			&&( this.buffer[2] === 0x03 || this.buffer[2] === 0x05 || this.buffer[2] === 0x07 )
			&&( this.buffer[3] === 0x04 || this.buffer[3] === 0x06 || this.buffer[3] === 0x08 )
		)return prt("zip","application/zip");
		if(this.checkString("MThd"))return prt("mid","audio/midi");
		if(
			this.checkString("wOFF")
			&&(
				this.check([0x00, 0x01, 0x00, 0x00],{offset:4})||
				this.checkString("OTTO",{offset:4})
			)
		)return prt("woff","font/woff");
		if(
			this.checkString("wOF2")
			&&(
				this.check([0x00, 0x01, 0x00, 0x00],{offset:4})||
				this.checkString("OTTO",{offset:4})
			)
		)return prt("woff2","font/woff2");
		if(this.check([0xD4, 0xC3, 0xB2, 0xA1]) || this.check([0xA1, 0xB2, 0xC3, 0xD4]))return prt("pcap","application/vnd.tcpdump.pcap");
		if(this.checkString("DSD "))return prt("dsf","audio/x-dsf");
		if(this.checkString("LZIP"))return prt("lz","application/x-lzip");
		if(this.checkString("fLaC"))return prt("flac","audio/x-flac");
		if(this.check([0x42, 0x50, 0x47, 0xFB]))return prt("bpg","image/bpg");
		if(this.checkString("wvpk"))return prt("wv","audio/wavpack");
		if(this.checkString("%PDF")){
			return prt("pdf","application/pdf");
		}
		if(this.check([0x00, 0x61, 0x73, 0x6D]))return prt("wasm","application/wasm");
		if(this.checkString("MAC "))return prt("ape","audio/ape");
		if(this.checkString("SQLi"))return prt("sqlite","application/x-sqlite3");
		if(this.check([0x4E, 0x45, 0x53, 0x1A]))return prt("nes","application/x-nintendo-nes-rom");
		if(this.checkString("Cr24"))return prt("crx","application/x-google-chrome-extension");
		if(
			this.checkString("MSCF") ||
			this.checkString("ISc(")
		)return prt("cab","application/vnd.ms-cab-compressed");
		if(this.check([0xED, 0xAB, 0xEE, 0xDB]))return prt("rpm","application/x-rpm");
		if(this.check([0xC5, 0xD0, 0xD3, 0xC6]))return prt("eps","application/eps");
		if(this.check([0x28, 0xB5, 0x2F, 0xFD]))return prt("zst","application/zst");
		if(this.check([0x7F, 0x45, 0x4C, 0x46]))return prt("elf","application/x-elf");
		if(this.check([0x21, 0x42, 0x44, 0x4E]))return prt("pst","application/vnd.ms-outlook");
		if(this.checkString("PAR1"))return prt("parquet","application/x-parquet");
		if(this.checkString("ttcf"))return prt("ttc","font/collection");
		if(this.check([0xCF, 0xFA, 0xED, 0xFE]))return prt("macho","application/x-mach-binary");
		if(this.check([0x04, 0x22, 0x4D, 0x18]))return prt("lz4","application/x-lz4");
		if(this.checkString("IMPM"))return prt("it","audio/x-it");
		if(this.checkString("ITSF"))return prt("chm","application/vnd.ms-htmlhelp");
		if(this.checkString(".RMF"))return prt("rm","application/vnd.rn-realmedia");

		// 5字节

		if(this.check([0x4F, 0x54, 0x54, 0x4F, 0x00]))return prt("otf","font/otf");
		if(this.checkString("#!AMR"))return prt("amr","audio/amr");
		if(this.checkString("{\\rtf"))return prt("rtf","application/rtf");
		if(
			this.checkString("-lh0-",{offset:2})||
			this.checkString("-lh1-",{offset:2})||
			this.checkString("-lh2-",{offset:2})||
			this.checkString("-lh3-",{offset:2})||
			this.checkString("-lh4-",{offset:2})||
			this.checkString("-lh5-",{offset:2})||
			this.checkString("-lh6-",{offset:2})||
			this.checkString("-lh7-",{offset:2})||
			this.checkString("-lzs-",{offset:2})||
			this.checkString("-lz4-",{offset:2})||
			this.checkString("-lz5-",{offset:2})||
			this.checkString("-lhd-",{offset:2})
		)return prt("lzh","application/x-lzh-compressed");
		if(this.check([0x00, 0x00, 0x01, 0xBA])){
			if(this.check([0x21],{offset:4,mask:[0xF1]}))return prt("mpg","video/MP1S");
			if(this.check([0x44],{offset:4,mask:[0xC4]}))return prt("mpg","video/MP2P");
		}
		if(this.checkString('DRACO'))return prt("drc","application/vnd.google.draco");

		// 6字节

		if(this.check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]))return prt("xz","application/x-xz");
		if(this.check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]))return prt("7z","application/x-7z-compressed");
		if(
			this.check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07])&&
			(this.buffer[6]=== 0x00 || this.buffer[6]=== 0x01)
		)return prt("rar","application/x-rar-compressed");
		if(this.checkString("<?xml "))return prt("xml","application/xml");
		if(this.checkString("solid "))return prt("stl","model/stl");
		if(this.checkString("070707"))return prt("cpio","application/x-cpio");

		// 7字节

		if(this.checkString("!<arch>")){
			const str = String.fromCharCode(...this.buffer.slice(8,21));
			if(str === "debian-binary")return prt("deb","application/x-deb");
			return prt("ar","application/x-unix-archive");
		}
		if(
			this.checkString("WEBVTT") &&
			[undefined, " ", "\n", "\r", "\t"].some(i=>this.buffer[6]===i)
		)return prt("vtt","text/vtt");

		// 8字节

		if(this.check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])){
			const dr = await this.detect_apng();
			if(typeof dr === "object")return dr;
			if(dr === null)return;
			return prt("png","image/png");
		}
		if(this.check([0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00]))return prt("arrow","application/x-apache-arrow");
		if(this.check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00]))return prt("glb","model/gltf-binary");
		if(
			this.check([0x66, 0x72, 0x65, 0x65],{offset:4})||
			this.check([0x6D, 0x64, 0x61, 0x74],{offset:4})||
			this.check([0x6D, 0x6F, 0x6F, 0x76],{offset:4})||
			this.check([0x77, 0x69, 0x64, 0x65],{offset:4})
		)return prt("mov","video/quicktime");

		// 9字节

		if(this.check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18]))return prt("orf","image/x-olympus-orf");
		if(this.checkString("gimp xcf "))return prt("xcf","image/x-xcf");
		if(
			this.checkString("ftyp",{offset:4})&&
			(this.buffer[8] & 0x60) !== 0x00
		){
			const brandMajor = String.fromCharCode(...this.buffer.slice(8,12)).replace("\0"," ").trim();
			switch(brandMajor){
				case "avif":
				case "avis":
					return prt("avif","image/avif");
				case "mif1":
					return prt("heic","image/heif");
				case "msf1":
					return prt("heic","image/heif-sequence");
				case "heic":
				case "heix":
					return prt("heic","image/heic");
				case "hevc":
				case "hevx":
					return prt("heic","image/heic-sequence");
				case "qt":
					return prt("mov","video/quicktime");
				case "M4V":
				case "M4VH":
				case "M4VP":
					return prt("m4v","video/x-m4v");
				case "M4P":
					return prt("m4p","video/mp4");
				case "M4B":
					return prt("m4b","audio/mp4");
				case "M4A":
					return prt("m4a","audio/x-m4a");
				case "F4V":
					return prt("f4v","video/mp4");
				case "F4P":
					return prt("f4p","video/mp4");
				case "F4A":
					return prt("f4a","audio/mp4");
				case "F4B":
					return prt("f4b","audio/mp4");
				case "crx":
					return prt("cr3","image/x-canon-cr3");
				default:
					if(brandMajor.startsWith("3g")){
						if(brandMajor.startsWith("3g2"))return prt("3g2","video/3gpp2");
						return prt("3gp","video/3gpp");
					}
					return prt("mp4","video/mp4");
			}
		}

		// 12字节

		if(this.checkString("RIFF")){
			if(this.checkString("WEBP",{offset:8}))return prt("webp","image/webp");
			if(this.checkString("AVI",{offset:8}))return prt("avi","video/vnd.avi");
			if(this.checkString("WAVE",{offset:8}))return prt("wav","audio/wav");
			if(this.checkString("QLCM",{offset:8}))return prt("qcp","audio/qcelp");
		}
		if(this.check([0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8]))return prt("rw2","image/x-panasonic-rw2");
		if(this.check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A]))return prt("ktx","image/ktx");
		if((this.check([0x7E, 0x10, 0x04]) || this.check([0x7E, 0x18, 0x04])) && this.check([0x30, 0x4D, 0x49, 0x45],{offset:4}))return prt("mie","application/x-mie");
		if(this.check([0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],{offset:2}))return prt("shp","application/x-esri-shape");
		if(this.check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])){
			// JPEG-2000
			const type = String.fromCharCode(...this.buffer.slice(20,24));
			switch(type){
				case "jp2 ":
					return prt("jp2","image/jp2");
				case "jpx ":
					return prt("jpx","image/jpx");
				case "jpm ":
					return prt("jpm","image/jpm");
				case "mjp2":
					return prt("mj2","image/mj2");
				default:
					return;
			}
		}

		// 14字节

		if(this.check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02]))return prt("mxf","application/mxf");

		// 15字节

		if(this.checkString("FUJIFILMCCD-RAW"))return prt("raf","image/x-fujifilm-raf");
		if(
			this.checkString("<!DOCTYPE ")
			&&(
				this.checkString("html>",{offset:10}) ||
				this.checkString("HTML",{offset:10})
			)
		)return prt("html","text/html");

		// 16字节

		if(this.checkString("Extended Module:"))return prt("xm","audio/x-xm");

		// 19字节

		if(this.checkString("Creative Voice File"))return prt("voc","audio/x-voc");

		// 其它特征不在文件头的

		if(this.checkString("SCRM",{offset:44}))return prt("s3m","audio/x-s3m");
		if(this.check([0x47]) && this.check([0x47],{offset:188}))return prt("mts","video/mp2t");
		if(this.check([0x47],{offset:4}) && this.check([0x47],{offset:196}))return prt("mts","video/mp2t");
		if(this.check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49],{offset:60}))return prt("mobi","application/x-mobipocket-ebook");
		if(this.check([0x44, 0x49, 0x43, 0x4D],{offset:128}))return prt("dcm","application/dicom");
		if(
			this.check([0x4C, 0x50],{offset:34})
			&&(
				this.check([0x00, 0x00, 0x01],{offset:8}) ||
				this.check([0x01, 0x00, 0x02],{offset:8}) ||
				this.check([0x02, 0x00, 0x02],{offset:8})
			)
		)return prt("eot","application/vnd.ms-fontobject");
		if(this.buffer.length >= 2 && this.check([0xFF, 0xE0],{mask:[0xFF, 0xE0]})){
			if(this.check([0x10], {offset: 1, mask: [0x16]})){
				// MPEG-2
				if(this.check([0x08], {offset: 1, mask: [0x08]}))return prt("aac","audio/aac");
				// MPEG-4
				return prt("aac","audio/aac");
			}
			if(this.check([0x02], {offset: 1, mask: [0x06]}))return prt("mp3","audio/mpeg");
			if(this.check([0x04], {offset: 1, mask: [0x06]}))return prt("mp2","audio/mpeg");
			if(this.check([0x06], {offset: 1, mask: [0x06]}))return prt("mp1","audio/mpeg");
		}

		// 简单的文本检测
		const readtext = await new Blob([data.slice(0,1048576)]).text();
		if(!/[\x00-\x08\v\f\x0E-\x1F\x7F-\x9F]/gs.test(readtext))return prt("txt","text/plain");
	}

	// 额外的附加检测逻辑

	async detect_apng(){// apng
		let offset = 8;
		const dv = new DataView(this.arrayBuffer), Ui8A = this.buffer;
		function read(){
			return {
				length: dv.getInt32(offset),
				type: String.fromCharCode(...Ui8A.slice(offset,offset+4)),
			};
		}
		do{
			const ck = read();
			if(ck.length < 0)return null;
			switch(ck.type){
				case "IDAT":
					return prt("png","image/png");
				case "acTL":
					return prt("apng","image/apng");
				default:
					offset += ck.length + 4;
			}
		}while(offset + 4 < Ui8A.length);
	}
}
export async function parse(buffer){
	return new FileTypeParser().parse(buffer);
}
