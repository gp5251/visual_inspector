<style lang="less">
    .vi_blender {
        .vi_select{
            width: 100px;
            display: inline-block;
            // box-shadow: 1px 1px 1px #aaa;
        }

        .vi-ivu-icon-ios-arrow-down:before{
            content: 'V' !important;
            font-weight: bold;
            transform: scale(.8, .5);
            display: inline-block;
        }
    }
</style>

<template>
    <div class="vi_blender">
        <Select :value="blendMode" size="small" @on-change="changeMode" class="vi_select">
            <Option :value="value" :key="item" v-for="(item, value) in modes">{{ item }}</Option>
        </Select>
    </div>
</template>

<script>
    import Select from '../iview/components/select';
    import Option from '../iview/components/option';

    export default {
        name: "Blender",
        components:{Select, Option},
        props: {
            blendMode: {
                type: String,
                default() {
                    return 'normal'
                }
            }
        },
        data() {
            return {
                modes: {
                    normal: '正常',
                    multiply: '正片叠底',
                    screen: '滤色',
                    overlay: '叠加',
                    darken: '变暗',
                    lighten: '变亮',
                    "color-dodge": '颜色减淡',
                    "color-burn": '颜色加深',
                    "hard-light": '强光',
                    "soft-light": '柔光',
                    difference: '差值',
                    exclusion: '排除',
                    hue: '色相',
                    saturation: '饱和度',
                    color: '颜色',
                    luminosity: '亮度',
                }
            }
        },
        methods: {
            changeMode(mode) {
                this.$emit('changeMode', mode)
            }
        }
    }
</script>
