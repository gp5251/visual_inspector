<style scoped lang="less">
    .vi_mockup {
        width: 100%;
        height: 100%;
        z-index: 9997;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(0, 0, 0, .5) url() no-repeat center ~"0 / 100%" auto;
        box-shadow: 0 0 1px 0 #ccc;
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
            padding: 3px;
            position: absolute;
            left: -3px;
            top: -3px;
            box-sizing: content-box;
            background: radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left top,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left bottom,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right top,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right bottom,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat left 50%,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat 50% top,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat 50% bottom,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right top,
            radial-gradient(transparent 0%, transparent 60%, gray 61%) no-repeat right 50%;
            background-size: 6px 6px;
        }
    }

</style>

<template>
    <div class="vi_mockup" :class="{freeze}" :style="mockupStyle"></div>
</template>

<script>
    import interact from 'interactjs';
    import {throttle} from "../utils";

    export default {
        name: "Mockup",
        props: ['src', 'opacity', 'freeze', 'blendMode', 'w', 'h', 'x', 'y'],
        watch: {
            x(val) {
                this.$el.setAttribute('data-x', val);
            },
            y(val) {
                this.$el.setAttribute('data-y', val);
            }
        },
        computed: {
            mockupStyle() {
                let style = {
                    opacity: this.opacity,
                    'mix-blend-mode': this.blendMode,
                    width: this.w + 'px',
                    height: this.h + 'px',
                    transform: `translate(${this.x}px, ${this.y}px)`,
                    backgroundImage: `url(${this.src})`
                };
                if (this.freeze) style.pointerEvents = 'none';
                return style;
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

                            x = x.toFixed(1);
                            y = y.toFixed(1);

                            this.$emit('moveAndResize', {left: x, top: y})
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

                            this.$emit('moveAndResize', {
                                width: event.rect.width.toFixed(1),
                                height: event.rect.height.toFixed(1),
                                left: x.toFixed(1),
                                top: y.toFixed(1)
                            })
                        }, 16)
                    );
            },
        },
        mounted() {
            this.initMockup();
        }
    }
</script>
