<style scoped lang="less">
    .vi_toggler{
        position: fixed;
        right: 5px;
        top: 5px;
        line-height: 30px;
        text-align: center;
        border-radius: 5px;
        border-color: black;
        background: #eee;
        z-index: 9999;
        touch-action: none;

        span:not(.moveBar){
            display: block;
            white-space: nowrap;
            line-height: 30px;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 0 5px;
            cursor: pointer;
        }

        .moveBar{
            border: 1px solid #ddd;
            border-radius: 2px;
            display: block;
            height: 15px;
            position: relative;

            &::after{
                content: '';
                position: absolute;
                top: -20%;
                height: 100%;
                left: 0;
                right: 0;
                background-color: #2d8cf0;
                border-bottom: 1px dotted #fff;
            }
        }
    }

</style>

<template>
    <div class="vi_toggler">
        <span class="moveBar"></span>
        <span @click="$emit('togglePanel')" >{{ panelTxt }}</span>
        <span @click="$emit('toggleMockup')" >{{ mockupTxt }}</span>
        <span class="vi_quit" @click="$emit('quit')">退出</span>
    </div>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "FloatingBar",
        props: ['showPanel', 'showMockup'],
        computed: {
            panelTxt() {
                return this.showPanel ? '收起面板' : '打开面板';
            },
            mockupTxt() {
                return  this.showMockup ? '隐藏图层' : '显示图层';
            }
        },
        mounted() {
            interact(this.$el)
                .draggable({
                    allowFrom: '.moveBar',
                    inertia: true,
                    onmove(event) {
                        let target = event.target,
                            // keep the dragged position in the data-x/data-y attributes
                            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        // translate the element
                        target.style.webkitTransform =
                            target.style.transform =
                                'translate(' + x + 'px, ' + y + 'px)';

                        // update the posiion attributes
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                });
        }
    }
</script>







