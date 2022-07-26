<style lang="less">
    .vi_mockup {
        width: 100%;
        height: 100%;
        z-index: 99990;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(0, 0, 0, .2) no-repeat center top / 100% auto;
        touch-action: none;
        will-change: translate, width, height;

        &.freeze{
            background-color: transparent;

            &::after{
                display: none;
            }
        }

        &::after{
            content: '';
            width: 100%;
            height: 100%;
            // padding: 3px;
            position: absolute;
            left: 0;
            top: 0;
            box-sizing: content-box;
            background: radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat left top,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat left bottom,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat right top,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat right bottom,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat left 50%,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat 50% top,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat 50% bottom,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat right top,
            radial-gradient(transparent 0%, transparent 60%, #333 61%) no-repeat right 50%;
            background-size: 6px 6px;
        }
    }

</style>

<template>
    <div class="vi_mockup" :class="{freeze}" :style="mockupStyle" :data-x="rect.x" :data-y="rect.y">
    </div>
</template>

<script>
    import interact from 'interactjs';
    import {throttle} from "../utils";

    export default {
        name: "Mockup",
        props: ['src', 'opacity', 'freeze', 'blendMode'],
        computed: {
            mockupStyle() {
                let {width, height, left, top} = this.$parent.mockup;

                let style = {
                    'mix-blend-mode': this.blendMode,
                    width: width + 'px',
                    height: height + 'px',
                    transform: `translate(${left}px, ${top}px)`,
                    backgroundImage: `url(${this.src})`, 
                    opacity: this.opacity
                };

                if (this.freeze) style.pointerEvents = 'none';
                return style;
            },
            rect() {
                let {width, height, left, top} = this.$parent.mockup;

                return {
                    w: width, 
                    h: height,
                    x: left,
                    y: top
                }
            }
        },
        methods: {
            initMockup() {
                interact(this.$el)
                    .draggable({
                        onmove: throttle(event => {
                            let target = event.target,
                                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                            this.$parent.mockup.left = x.toFixed(1);
                            this.$parent.mockup.top = y.toFixed(1);
                        }, 12)
                    })
                    .resizable({
                        edges: {left: true, right: true, bottom: true, top: true},
                        restrictSize: {
                            min: {width: 100, height: 50},
                        },
                        inertia: true,
                    })
                    .on('resizemove', throttle(event => {
                            let target = event.target,
                                x = (parseFloat(target.getAttribute('data-x')) || 0),
                                y = (parseFloat(target.getAttribute('data-y')) || 0);

                            x += event.deltaRect.left;
                            y += event.deltaRect.top;

                            Object.assign(this.$parent.mockup, {
                                width: event.rect.width.toFixed(1),
                                height: event.rect.height.toFixed(1),
                                left: x.toFixed(1),
                                top: y.toFixed(1)
                            });
                        }, 16)
                    );
            },
        },
        mounted() {
            this.initMockup();
        }
    }
</script>
