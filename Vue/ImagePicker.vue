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
	}
</style>

<template>
	<div class="imagePicker">
		<span class="tit">{{ $t("insert") }}</span>
		<input type="file" @change="insertImg" :key="newInputKey" accept="image/*"/>
	</div>
</template>

<script>
	import { getImgSrcFromDataUrl } from "../utils";

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
			src(val, oldVal) {
				if (oldVal) {
					console.log('oldSrc', oldVal);

					chrome.storage.local.remove(['_viData', '_viDataUrl', '_url']);
					if (!document.documentElement._cspBlockedBlob) window.URL.revokeObjectURL(oldVal);
				}
			}
		},
		data() {
			return {
				src: '',
				newInputKey: 0
			}
		},
		methods: {
			insertImg(e) {
				let [file] = e.target.files;
				this.readFileAsDataUrl(file)
					.then(async (dataUrl) => {
						this.src = await getImgSrcFromDataUrl(dataUrl);
						this.$emit('getImgSrc', this.src, dataUrl);

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
			}
		}
	}
</script>
