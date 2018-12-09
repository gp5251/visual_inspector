<style scoped lang="less">
	.vi_tip{
		white-space: nowrap;
		background-color: #2d8cf0;
		color: white;
		pointer-events: none;
		padding: 0;
		margin: 0;
		line-height: 1;

		position: fixed; right: 5px; top: 5px; z-index: 99992;
		border-radius: 3px;
		opacity: 1;
		font-size: 14px;
		padding: 6px 12px;

		&.vi_hide{
			animation: vi_fadeout ease-out .5s forwards;
		}
	}

	@keyframes vi_fadeout {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>

<template>
	<div class="vi_tip" :class="{vi_hide: this.hide}" v-if="tipMsg.length" @animationend="tipMsg = ''">{{ tipMsg }}</div>
</template>

<script>
	export default {
        name: "Tip",
		props: {
        	tip: {
				type: String,
        		default() {
        			return ''
				}
			}
		},
		watch: {
        	tip(val) {
        		this.tipMsg = val;
        		this.hide = false;

        		if (this._tid) clearTimeout(this._tid);
        		this._tid = setTimeout(()=>{
        			this.hide = true
        		}, this.delay);
			}
		},
        data() {
        	return {
        		tipMsg: '',
				hide: false,
				delay: 3000
            }
        }
    }
</script>







