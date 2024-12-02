// 文件类型推断
/* 在浏览器上进行推断文件类型
 * 照着 https://github.com/sindresorhus/file-type 项目进行编写，将该项目的逻辑改为浏览器可直接使用。
 */

function check(buffer, bytes, options){// 依照给定的数据和参数，比较缓冲流
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
function stringToBytes(str){// 将字符串转换为16进制数据
	return [...str].map(char => char.charCodeAt(0));
}
function generBuffer(arrBuffer){// 将缓冲数组转换为可读取的Unit8Array
	if(!(arrBuffer instanceof ArrayBuffer))throw new TypeError("输入的不是缓冲数组");
	return new Uint8Array(arrBuffer);
}
function prt(ext, mime){// 按照一定的格式返回检测结果
	return{ext, mime};
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

		// 3字节

		if(this.check([0x47, 0x49, 0x46]))return prt("gif","image/gif");
		if(this.check([0x1F, 0x8B, 0x08]))return prt("gz","application/gzip");
		if(this.check([0x42, 0x5A, 0x68]))return prt("bz2","application/x-bzip2");
		if(this.checkString("ID3"))return prt("mp3","audio/mp3");

		// 4字节

		if(this.check([0xFF, 0xD8, 0xFF])){
			if(this.check([0xF7],{offset:3}))return prt("jls","image/jls");
			return prt("jpg","image/jpeg");
		}
		if(this.checkString("WEBP",{offset:8}))return prt("webp","image/webp");
		if(this.check([0x42, 0x50, 0x47, 0xFB]))return prt("bpg","image/bpg");
		if(this.checkString("FORM"))return prt("aif","audio/aiff");
		if(this.checkString("MThd"))return prt("mid","audio/midi");
		if(this.checkString("fLaC"))return prt("flac","audio/flac");
		if(this.checkString("MAC "))return prt("ape","audio/ape");
		if(this.checkString("OggS")){
			const type = this.buffer.slice(28,36);
			if(check(type,[0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]))return prt("opus","audio/opus");
			if(check(type,[0x7F, 0x46, 0x4C, 0x41, 0x43]))return prt("oga","audio/ogg");
			if(check(type,[0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20]))return prt("spx","audio/ogg");
			if(check(type,[0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73]))return prt("ogg","audio/ogg");
			if(check(type,[0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61]))return prt("ogv","video/ogg");
			if(check(type,[0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00]))return prt("ogm","video/ogg");
			// Default
			return prt("ogx","application/ogg");
		}
		if(this.checkString("wvpk"))return prt("wv","audio/wavpack");
		if(this.checkString("IMPM"))return prt("it","audio/x-it");
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
		if(this.check([0x46, 0x0C, 0x56, 0x01]))return prt("flv","video/x-flv");
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
		if(this.checkString("DSD "))return prt("dsf","audio/x-dsf");
		if(this.checkString("LZIP"))return prt("lz","application/x-lzip");
		if(this.check([0x28, 0xB5, 0x2F, 0xFD]))return prt("zst","application/zst");
		if(this.check([0x00, 0x61, 0x73, 0x6D]))return prt("wasm","application/wasm");

		// 5字节

		if(this.checkString("#!AMR"))return prt("amr","audio/amr");
		if(this.check([0x00, 0x00, 0x01, 0xBA])){
			if(this.check([0x21],{offset:4,mask:[0xF1]}))return prt("mpg","video/MP1S");
			if(this.check([0x44],{offset:4,mask:[0xC4]}))return prt("mpg","video/MP2S");
		}
		if(this.check([0x4F, 0x54, 0x54, 0x4F, 0x00]))return prt("otf","font/otf");
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

		// 6字节

		if(this.check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00]))return prt("xz","application/x-xz");
		if(this.check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]))return prt("7z","application/x-7z-compressed");
		if(
			this.check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07])&&
			(this.buffer[6]=== 0x00 || this.buffer[6]=== 0x01)
		)return prt("rar","application/x-rar-compressed");
		if(this.checkString("solid "))return prt("stl","model/stl");

		// 7字节

		if(this.checkString("!<arch>")){
			const str = String.fromCharCode(...this.buffer.slice(8,21));
			if(str === "debian-binary")return prt("deb","application/x-deb");
			return prt("ar","application/x-unix-archive");
		}

		// 8字节

		if(this.check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])){
			const dr = await this.detect_apng();
			if(typeof dr === "object")return dr;
			if(dr === null)return;
			return prt("png","image/png");
		}
		if(
			this.check([0x66, 0x72, 0x65, 0x65],{offset:4})||
			this.check([0x6D, 0x64, 0x61, 0x74],{offset:4})||
			this.check([0x6D, 0x6F, 0x6F, 0x76],{offset:4})||
			this.check([0x77, 0x69, 0x64, 0x65],{offset:4})
		)return prt("mov","video/quicktime");

		// 9字节

		if(this.check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18]))return prt("orf","image/x-olympus-orf");
		if(this.checkString("gimp xcf "))return prt("xcf","image/x-xcf");

		// 12字节

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

		// 其它特征不在文件头的

		if(this.checkString("SCRM",{offset:44}))return prt("s3m","audio/x-s3m");
		if(this.check([0x47]) && this.check([0x47],{offset:188}))return prt("mts","video/mp2t");
		if(this.check([0x47],{offset:4}) && this.check([0x47],{offset:196}))return prt("mts","video/mp2t");
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
