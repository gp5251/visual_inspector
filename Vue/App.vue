<style scoped lang="less">
    .mockup {
        width: 100%;
        height: 100%;
        z-index: 9999;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        background: rgba(255, 255, 255, .5) url() no-repeat center ~"0 / 100%" auto;
    }
    .controllers {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #eee;
        z-index: 9999;
        padding: 5px;
    }
    button{
        padding: 5px 12px;
        margin-right: 5px;
    }
    input[type=file]{
        margin: 5px 0;
    }
    input[type=radio] ,
    input[type=checkbox] {
        width: 20px;
        height: 20px;
    }
    .opacity{
        display: inline-block;width: 30px; text-align: center; vertical-align: 3px
    }
</style>

<template>
    <div class="feHelper">
        <div class="mockup" ref="mockup" :style="mockupStyle" v-show="img.src && showMockup"></div>

        <div class="controllers" id="controllers">
            <h3>FeHelper</h3>

            <h4>当前图片：{{ img.name }}</h4>
            <span>选取设计稿：</span> <input type="file" @change="changeImg" />

            <div v-if="img.src">
                <span>图片大小：{{ ['原图大小', '宽度适配', '高度适配', '显示全图'][bgType] }}</span> <br/>
                <input type="radio" v-model="bgType" value="0"> 原图大小
                <input type="radio" v-model="bgType" value="1"> 宽度适配
                <input type="radio" v-model="bgType" value="2"> 高度适配
                <input type="radio" v-model="bgType" value="3"> 显示全图
                <!--<button @click="autoSize(0)">原图大小</button>-->
                <!--<button @click="autoSize(1)">宽度适配</button>-->
                <!--<button @click="autoSize(2)">高度适配</button>-->
                <!--<button @click="autoSize(3)">显示全图</button>-->

                <span>{{showMockup ? '隐藏' : '显示'}}：</span> <input type="checkbox" v-model="showMockup" />
                <span>冻结：</span> <input type="checkbox" v-model="freeze" />

                <span class="opacity">透明度：{{ opacity }}</span> <input type="range" v-model="opacity" max="1" min="0" step="0.05"/> <br/>

                <span>混合模式：</span>
                <select v-model="blendMode">
                    <option value="normal">正常</option>
                    <option value="multiply">正片叠底</option>
                    <option value="screen">滤色</option>
                    <option value="overlay">叠加</option>
                    <option value="darken">变暗</option>
                    <option value="lighten">变亮</option>
                    <option value="color-dodge">颜色减淡</option>
                    <option value="color-burn">颜色加深</option>
                    <option value="hard-light">强光</option>
                    <option value="soft-light">柔光</option>
                    <option value="difference">差值</option>
                    <option value="exclusion">排除</option>
                    <option value="hue">色相</option>
                    <option value="saturation">饱和度</option>
                    <option value="color">颜色</option>
                    <option value="luminosity">亮度</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script>
    import interact from 'interactjs';

    export default {
        name: "App",
        data() {
            return {
                opacity: 1,
                showMockup: true,
                freeze: 0,
                blendMode: 'normal',
                bgType: 1,
                img: {
                    name: '暂无',
                    width: 0,
                    height: 0,
                    src: ''
                }
            }
        },
        computed: {
            mockupStyle() {
                let style = {opacity: this.opacity, 'mix-blend-mode': this.blendMode};
                if (this.freeze) style.pointerEvents = 'none';
                if (this.img.src) style.backgroundImage = `url(${this.img.src})`;
                style.backgroundSize = this.getBgSize(this.bgType);
                return style;
            }
        },
        methods: {
            getBgSize(type = 1) {
                let size;
                if (type == 0) {
                    // 原图大小
                    size = `${this.img.width}px ${this.img.height}px`;
                } else if (type == 1) {
                    // 宽度适配
                    size = '100% auto';
                } else if (type == 2) {
                    // 高度适配
                    size = 'auto 100%';
                } else if (type == 3) {
                    // 全图显示
                    size = 'cover';
                }
                console.log('size', size);
                return size;
            },
            changeImg(e) {
                let [file] = e.target.files;
                this.getImg(file).then(img => {
                    this.img = {
                        name: file.name,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        src: img.src
                    }
                }, e => console.error(e) );
            },

            getImg(url) {
                return new Promise((resolve, reject)=>{
                    const img = new Image;
                    img.src = URL.createObjectURL(url);
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                })
            },

            // autoSize(type = 0) {
            //     const {width, height} = this.img;
            //     if (type === 0) {
            //         // 原图大小 origin
            //         this.$refs.mockup.style.backgroundSize = `${width}px ${height}px`;
            //     } else if (type === 1) {
            //         // 宽度适配 cover
            //         this.$refs.mockup.style.backgroundSize = '100% auto';
            //     } else if (type === 2) {
            //         // 高度适配 cover
            //         this.$refs.mockup.style.backgroundSize = 'auto 100%';
            //     } else if (type === 3) {
            //         // 全图显示 contain
            //         this.$refs.mockup.style.backgroundSize = 'cover';
            //     }
            // },

            // dataURLtoBlob(dataUrl) {
            //     let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            //     while (n--) u8arr[n] = bstr.charCodeAt(n);
            //     return new Blob([u8arr], {type: mime});
            // },
            //
            // readFileAsDataUrl(file) {
            //     return new Promise(resolve => {
            //         const reader = new FileReader();
            //         reader.onload = function(e) {resolve(e.target.result)};
            //         reader.readAsDataURL(file);
            //     })
            // },

            initMockup() {
                interact(this.$refs.mockup)
                    .draggable({
                        inertia: true,
                        autoScroll: true,
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
                        },
                        // restrict: {
                        //   restriction: 'parent',
                        //   elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                        // }
                    })
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: true, right: true, bottom: true, top: true},

                        // minimum size
                        restrictSize: {
                            min: {width: 100, height: 50},
                        },

                        inertia: true,
                    })
                    .on('resizemove', function (event) {
                        let target = event.target,
                            x = (parseFloat(target.getAttribute('data-x')) || 0),
                            y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // update the element's style
                        target.style.width = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.webkitTransform = target.style.transform =
                            'translate(' + x + 'px,' + y + 'px)';

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
                    });
            },
            send(data, cb) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
                        cb && cb(response);
                        console.log('response', response);
                    })
                })
            }
        },
        mounted() {
            this.initMockup();
        }
    }
</script>
