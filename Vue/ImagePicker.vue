<style scoped lang="less">
	.vi_imagePicker {
		padding-top: 5px;
		position: relative;
		white-space: nowrap;
		min-width: 150px;

		.tit {
			display: inline-block;
			width: 100%;
			background-color: #2d8cf0;
			text-align: center;
			line-height: 30px;
			color: white;
			padding: 5px 10px;
			border-radius: 3px;
			font-size: 12px;
			box-sizing: border-box;
		}

		input {
			opacity: 0;
			width: 100%;
			height: 100%;
			position: absolute;
			left: 0;
			top: 0;
		}

		button {
			margin-top: 5px;
			width: 100%;
			height: 30px;
			border-radius: 3px;
			background-color: #808695;
			color: white;
		}
	}
</style>

<template>
	<div class="imagePicker">
		<span class="tit">{{ $t("insert") }}</span>
		<input type="file" @change="insertImg" :key="newInputKey" accept="image/*" />
	</div>
</template>

<script>
	export default {
		name: "ImageBtn",
		props: {
			tip: {
				type: String,
				default() {
					return ''
				}
			}
		},
		watch: {
			tip(val) { }
		},
		data() {
			return {
				newInputKey : 0
			}
		},
		methods: {
			insertImg(e) {
				let [file] = e.target.files;
				this.readFileAsDataUrl(file)
					.then(async (dataUrl)=>{
						let src = await this.getImgSrc(dataUrl)
						this.$emit('getImgSrc', src);

						this.newInputKey = Math.random();
					})
					.catch(e => {
						console.error(e);
					})
			},
			readFileAsDataUrl(file) {
				return new Promise(resolve => {
					const reader = new FileReader();
					reader.onload = function (e) {
						resolve(e.target.result)
					};
					reader.readAsDataURL(file);
				})
			},
			dataURLtoBlob(dataUrl) {
				let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
				while (n--) u8arr[n] = bstr.charCodeAt(n);
				return new Blob([u8arr], {type: mime});
			},
			async getImgSrc(dataUrl) {
				let cspBlockedBlob = document.documentElement._cspBlockedBlob;
				if (cspBlockedBlob === 1) return dataUrl;
				else if (cspBlockedBlob === 0) {
					let blobObj = this.dataURLtoBlob(dataUrl);
					return window.URL.createObjectURL(blobObj);
				}

				try {
					let d = await this.checkCSPForGlob(dataUrl);
					document.documentElement._cspBlockedBlob = 0;
					return d;
				} catch (err) {
					document.documentElement._cspBlockedBlob = 1;
					return dataUrl;
				}
			},
			checkCSPForGlob(dataUrl) {
				return new Promise((resolve, reject) => {
					let handleCspOnce = function(e) {
						if (e.blockedURI === 'blob' && e.violatedDirective === 'img-src') reject();
						document.removeEventListener("securitypolicyviolation", handleCspOnce);
						div.remove();
					};
					let blobObj = this.dataURLtoBlob(dataUrl);
					let url = window.URL.createObjectURL(blobObj);
					let div = document.createElement('div');
					div.style.cssText=`
					display:none;
					width: 100px;
					height: 100px;
					background: url(${url});
				`;
					document.body.appendChild(div);
					document.addEventListener("securitypolicyviolation", handleCspOnce);
					setTimeout(function (){
						div.remove();
						resolve(url)
					}, 200);
				})
			},
		}
	}
</script>
