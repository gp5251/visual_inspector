<style scoped lang="less">
    .vi_ruler{
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(0,0,0,.1);
        z-index: 99991;
		cursor: crosshair;

		.vi_rulerItem{
			position: absolute;
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
			/*outline: 1px solid rgba(0, 0, 0, 0.5);*/
			background-color: rgba(0, 0, 0, 0.1);
			/*z-index: 99993;*/

			.txt{
				white-space: nowrap;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				font-size: 14px;
				background-color: rgba(237,237,237,1);
				border-radius: 3px;
				padding: 2px 3px;
				line-height: 1;
			}

			.close{
				line-height: 1;
				position: absolute;
				right: 2px;
				top: 2px;
				/*border: 1px solid #000;*/
				background-color: gray;
				cursor: pointer;
				padding: 2px;
				color: rgba(237,237,237,1);
			}

			/*&::before{*/
				/*content: '';*/
				/*position: absolute;*/
				/*left: 0;*/
				/*right: 0;*/
				/*top: 50%;*/
				/*border-top: 1px dotted rgba(237,237,237,1);*/
				/*margin-top: -.5px;*/
				/*background-color: white;*/
				/*z-index: -1;*/
			/*}*/

			/*&::after{*/
				/*content: '';*/
				/*position: absolute;*/
				/*left: 50%;*/
				/*top: 0;*/
				/*bottom: 0;*/
				/*border-left: 1px dotted rgba(237,237,237,1);*/
				/*margin-left: -.5px;*/
				/*background-color: white;*/
				/*z-index: -1;*/
			/*}*/
		}

		.vi_rulerCrossX{
			position: absolute;
			left: 0;
			right: 0;
			height: 1px;
			margin-top: -.5px;
			background-color: rgba(0,0,0,.5);
			pointer-events: none;
		}
		.vi_rulerCrossY{
			position: absolute;
			top: 0;
			bottom: 0;
			width: 1px;
			margin-left: -.5px;
			background-color: rgba(0,0,0,.5);
			pointer-events: none;
		}
    }
</style>

<template>
    <div class="vi_ruler"
		 @dblclick.stop="moveCrosshair = !moveCrosshair"
		 @touchstart="addItem"
		 @mousedown="addItem"
		 @touchmove.prevent="moveHandler"
		 @mousemove="moveHandler"
		 @touchend="drawDone"
		 @mouseup="drawDone">

		<div class="vi_rulerItem"
			 @click.stop
			 v-for="(item, index) in items"
			 :style="{width: item.w + 'px', height: item.h + 'px', left: item.x + 'px', top: item.y + 'px'}">
			<span class="close" @touchstart.stop="remove(index)" @mousedown.stop="remove(index)">X</span>
			<span class="txt">{{ item.w | toInt }}px {{ item.h | toInt }}px</span>
		</div>

		<span class="vi_rulerCrossX" :style="{top: top + 'px'}"></span>
		<span class="vi_rulerCrossY" :style="{left: left + 'px'}"></span>
    </div>
</template>

<script>
	import { throttle } from "../utils/index";

	export default {
        name: "Ruler",
        computed: { },
        data() {
        	return {
        		items: [],
				startDraw: false,
				left:0,
				top:0,
				moveCrosshair: true
            }
        },
		methods: {
        	moveHandler: throttle(function (e){
        		this.showCrosshair(e);
				this.draw(e);
			}, 50),
			draw(e) {
				if (!this.startDraw) return;

				const item = this.items[this.items.length - 1];
				if (item) {
					let ex = e.touches ? e.touches[0].clientX : e.clientX;
					let ey = e.touches ? e.touches[0].clientY : e.clientY;
					let w = ex - item._x;
					let h = ey - item._y;

					if (w > 0) {
						item.w = w;
						item.x = item._x;
					} else {
						item.w = Math.abs(w);
						item.x = item._x + w;
					}

					if (h > 0) {
						item.h = h;
						item.y = item._y;
					} else {
						item.h = Math.abs(h);
						item.y = item._y + h;
					}
				}
			},
			addItem(e) {
				let ex = e.touches ? e.touches[0].clientX : e.clientX;
				let ey = e.touches ? e.touches[0].clientY : e.clientY;
				this.items.push({
					w: 0,
					h: 0,
					_x: ex,
					_y: ey,
					x: ex,
					y: ey
				});
				this.startDraw = true;
			},
			drawDone() {
        		this.startDraw = false;
				const item = this.items[this.items.length - 1];
				if (item && item.w === 0 && item.h === 0) this.items.pop();

				if (this.items.length > 12) this.remove(0);
			},
			remove(index) {
        		this.items.splice(index, 1);
			},
			showCrosshair(e) {
        		if (!this.moveCrosshair) return;
        		if (e.touches) {
					this.left = e.touches[0].clientX;
					this.top = e.touches[0].clientY;
				} else {
					this.left = e.clientX;
					this.top = e.clientY;
				}
			}
		},
		filters: {
        	toInt(n) {
        		return parseInt(n)
			}
		}
    }
</script>







