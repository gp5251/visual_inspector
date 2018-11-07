<style scoped lang="less">
    .vi_blender {
        .tit{
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 4px 12px;

            .ico{
                vertical-align: middle;
                font-weight: bold;
            }
        }
    }
</style>

<template>
    <div class="vi_blender">
        <Dropdown trigger="click">
            <span class="tit">{{ curMode }} <span class="ico">^</span></span>
            <DropdownMenu slot="list">
                <DropdownItem
                        :selected="key === blendMode"
                        :key="key"
                        v-for="(value, key) in modes"
                        @click.native="$emit('changeMode', key)">{{ value }}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </div>
</template>

<script>
    import Dropdown from '../iview/components/dropdown';
    import DropdownMenu from '../iview/components/dropdown-menu';
    import DropdownItem from '../iview/components/dropdown-item';

    export default {
        name: "Blender",
        components:{Dropdown, DropdownMenu, DropdownItem},
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
        computed: {
            curMode() {
                return this.modes[this.blendMode];
            }
        }
    }
</script>
