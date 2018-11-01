<style scoped lang="less">
    .blender {
        display: inline-block;

        .select{
            display: inline-block;
        }
    }
</style>

<template>
    <div class="blender">
        <span>对比模式：</span>
        <Select :value="blendMode" size="small" @on-change="changeMode" class="select">
            <Option :value="value" v-for="(item, value) in modes">{{ item }}</Option>
        </Select>
    </div>
</template>

<script>
    export default {
        name: "Blender",
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
                console.log(mode);
                this.$emit('changeMode', mode)
            }
        }
    }
</script>
