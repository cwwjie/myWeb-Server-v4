/**
 * 我的自定义加算法
 * @param {string} value 要加密的第一个值
 * @param {string} token 要加密的值二个值
 * @return {string} 加密后的值
 */
const myCrypto = function (value, token) {
    /**
     * SHA1 加密
     * https://blog.csdn.net/k21325/article/details/54379709
     * @param {string} token 要加密的值
     * @return {string} 加密后的值
     */
    const myCrypto_SHA1 = function (token) {
        function add(x, y) {
            return((x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)) ^ (x & 0x80000000) ^ (y & 0x80000000);
        }
         
        function SHA1hex(num) {
            var sHEXChars = "0123456789abcdef";
            var str = "";
            for(var j = 7; j >= 0; j--)
                str += sHEXChars.charAt((num >> (j * 4)) & 0x0F);
            return str;
        }
         
        function AlignSHA1(sIn) {
            var nblk = ((sIn.length + 8) >> 6) + 1,
                blks = new Array(nblk * 16);
            for(var i = 0; i < nblk * 16; i++) blks[i] = 0;
            for(i = 0; i < sIn.length; i++)
                blks[i >> 2] |= sIn.charCodeAt(i) << (24 - (i & 3) * 8);
            blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
            blks[nblk * 16 - 1] = sIn.length * 8;
            return blks;
        }
         
        function rol(num, cnt) {
            return(num << cnt) | (num >>> (32 - cnt));
        }
         
        function ft(t, b, c, d) {
            if(t < 20) return(b & c) | ((~b) & d);
            if(t < 40) return b ^ c ^ d;
            if(t < 60) return(b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }
         
        function kt(t) {
            return(t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
                (t < 60) ? -1894007588 : -899497514;
        }
         
        function SHA1(sIn) {
            var x = AlignSHA1(sIn);
            var w = new Array(80);
            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            var e = -1009589776;
            for(var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;
                for(var j = 0; j < 80; j++) {
                    if(j < 16) w[j] = x[i + j];
                    else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    var t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
                    e = d;
                    d = c;
                    c = rol(b, 30);
                    b = a;
                    a = t;
                }
                a = add(a, olda);
                b = add(b, oldb);
                c = add(c, oldc);
                d = add(d, oldd);
                e = add(e, olde);
            }
            var SHA1Value = SHA1hex(a) + SHA1hex(b) + SHA1hex(c) + SHA1hex(d) + SHA1hex(e);
            return SHA1Value.toUpperCase();
        }

        return SHA1(token);
    }
    /**
     * MD5 加密
     * https://blog.csdn.net/k21325/article/details/54379635
     * @param {string} token 要加密的值
     * @return {string} 加密后的值
     */
    const myCrypto_MD5 = function (token) {
        var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase        */
        // var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */
        var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode      */

        /*
        * These are the functions you'll usually want to call
        * They take string arguments and return either hex or base-64 encoded strings
        */
        function hex_md5(s) {
            return binl2hex(core_md5(str2binl(s), s.length * chrsz));
        }

        // function b64_md5(s) {
        //     return binl2b64(core_md5(str2binl(s), s.length * chrsz));
        // }

        // function hex_hmac_md5(key, data) {
        //     return binl2hex(core_hmac_md5(key, data));
        // }

        // function b64_hmac_md5(key, data) {
        //     return binl2b64(core_hmac_md5(key, data));
        // }

        /* Backwards compatibility - same as hex_md5() */
        // function calcMD5(s) {
        //     return binl2hex(core_md5(str2binl(s), s.length * chrsz));
        // }

        /*
        * Perform a simple self-test to see if the VM is working
        */
        // function md5_vm_test() {
        //     return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
        // }

        /*
        * Calculate the MD5 of an array of little-endian words, and a bit length
        */
        function core_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return [a, b, c, d];

        }

        /*
        * These functions implement the four basic operations the algorithm uses.
        */
        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /*
        * Calculate the HMAC-MD5, of a key and some data
        */
        // function core_hmac_md5(key, data) {
        //     var bkey = str2binl(key);
        //     if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

        //     var ipad = Array(16),
        //         opad = Array(16);
        //     for (var i = 0; i < 16; i++) {
        //         ipad[i] = bkey[i] ^ 0x36363636;
        //         opad[i] = bkey[i] ^ 0x5C5C5C5C;
        //     }

        //     var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
        //     return core_md5(opad.concat(hash), 512 + 128);
        // }

        /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
        * Bitwise rotate a 32-bit number to the left.
        */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
        * Convert a string to an array of little-endian words
        * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
        */
        function str2binl(str) {
            var bin = [];
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz)
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
            return bin;
        }

        /*
        * Convert an array of little-endian words to a hex string.
        */
        function binl2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
            }
            return str;
        }

        /*
        * Convert an array of little-endian words to a base-64 string
        */
        // function binl2b64(binarray) {
        //     var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        //     var str = "";
        //     for (var i = 0; i < binarray.length * 4; i += 3) {
        //         var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
        //         for (var j = 0; j < 4; j++) {
        //             if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
        //             else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
        //         }
        //     }
        //     return str;
        // }

        return hex_md5(token);
    }

    return myCrypto_SHA1(`${token}${myCrypto_MD5(value)}`);
}

/**
 * 验证 payload 来自于 rejiejay自定义 加密
 * @param {object} payload 请求体
 * @param {string} token IQHE4A7LpCSuYa9le5kKB2gMoOyPDSf3ctdN6nhV
 * @return {string} signature cd2c432c30f77dc3d008812010b76d06874771f1
 */
const validatingPayloads = (payload, token) => {
    return myCrypto(payload, token);
}

module.exports = validatingPayloads;
