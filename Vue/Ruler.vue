<style scoped lang="less">
    .vi_ruler{
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: rgba(0,0,0,.05);
        z-index: 99991;
		cursor: crosshair;

		.vi_rulerItem{
			position: absolute;
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
			background-color: rgba(0, 0, 0, 0.1);

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
				border: 1px solid #000;
				background-color: gray;
				cursor: pointer;
				padding: 2px;
				color: rgba(237,237,237,1);
			}
		}
    }
</style>

<template>
    <div class="vi_ruler"
		 @touchstart="addItem"
		 @mousedown="addItem"
		 @touchmove.prevent="draw"
		 @mousemove="draw"
		 @touchend="stopDrawing"
		 @mouseup="stopDrawing">

		<div class="vi_rulerItem"
			 v-for="(item, index) in items"
			 :style="{width: item.w + 'px', height: item.h + 'px', left: item.x + 'px', top: item.y + 'px'}">
			<span class="close" @touchstart.prevent="remove(index)" @mousedown.prevent="remove(index)">X</span>
			<span class="txt">{{ item.w | toInt }}px {{ item.h | toInt }}px</span>
		</div>
    </div>
</template>

<script>
	import { throttle } from "../utils/index";
	let draw = throttle(function (e){
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
	}, 32);

	export default {
        name: "Ruler",
        computed: { },
        data() {
        	return {
        		items: [],
				startDraw: false
            }
        },
		methods: {
        	draw(e) {
        		draw.bind(this, e)();
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
			stopDrawing() {
        		this.startDraw = false;
				const item = this.items[this.items.length - 1];
				if (item.w === 0 && item.h === 0) this.items.pop();
			},
			remove(index) {
        		this.items.splice(index, 1);
			}
		},
		filters: {
        	toInt(n) {
        		return parseInt(n)
			}
		},
        mounted() {
        	//
        }
    }
</script>







