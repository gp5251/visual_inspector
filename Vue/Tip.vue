<style scoped lang="less">
	.vi_tip{
		white-space: nowrap;
		background-color: #2d8cf0;
		color: white;
		pointer-events: none;

		position: fixed; right: 5px; top: 5px; z-index: 99992;
		border-radius: 3px;
		opacity: 1;
		font-size: 14px;

		&.vi_show{
			padding: 6px 12px;
		}

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
	<div class="vi_tip vi_show" :class="{vi_hide: this.hide}" v-if="tipMsg.length">{{ tipMsg }}</div>
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







