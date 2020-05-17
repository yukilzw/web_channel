/**
 * @description 编辑器属性操作面板
 */
import React, { useContext, useCallback, useRef, useMemo } from 'react';
import storeContext, { EditFuncContext } from '../context';
import { searchTree, EnumEdit } from './common';
import { record } from './record';
import { Tabs, Layout, Input, Select, Switch, Tooltip, Popover, message } from 'antd';
import { FolderTwoTone, LeftCircleTwoTone, RightCircleTwoTone, DeleteTwoTone,
    CopyTwoTone, PieChartTwoTone, SnippetsTwoTone, EyeTwoTone, WalletTwoTone,
    UpSquareTwoTone, DownSquareTwoTone
} from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import style from './style/index.less';

const { TabPane } = Tabs;
const { Option } = Select;
const tab = ['样式', '属性'];
// 定义固有的样式属性配置项，后续可持续拓展（自定义属性配置项没有固有的，是根据每个组件JSON中staticProps动态渲染的）
const initStylesItemArr = require('./_style.json');

const Edit = () => {
    const { savePage, deleteNode, copeNode, pasteNode, cutNode, returnEdit, resumeEdit, changePosNode } = useContext(EditFuncContext);

    return <div className={style.edt}>
        <a onClick={savePage}>
            <Tooltip placement="left" title={<span>保存(Ctrl+S)</span>}>
                <FolderTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={returnEdit}>
            <Tooltip placement="left" title={<span>撤销(Ctrl+Z)</span>}>
                <LeftCircleTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={resumeEdit}>
            <Tooltip placement="left" title={<span>恢复(Ctrl+Y)</span>}>
                <RightCircleTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={deleteNode}>
            <Tooltip placement="left" title={<span>删除(DEL)</span>}>
                <DeleteTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={copeNode}>
            <Tooltip placement="left" title={<span>复制(Ctrl+C)</span>}>
                <CopyTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={cutNode}>
            <Tooltip placement="left" title={<span>剪切(Ctrl+X)</span>}>
                <PieChartTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={pasteNode}>
            <Tooltip placement="left" title={<span>粘贴(Ctrl+V)</span>}>
                <SnippetsTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => changePosNode(-1)}>
            <Tooltip placement="left" title={<span>上移节点(↑)</span>}>
                <UpSquareTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => changePosNode(1)}>
            <Tooltip placement="left" title={<span>下移节点(↓)</span>}>
                <DownSquareTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => message.warn('请按住空格后拖动画布、鼠标滚轮')}>
            <Tooltip placement="left" title={<span>移动画布(Space+滚动+左键)</span>}>
                <EyeTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a href="/template/page.json" download>
            <Tooltip placement="left" title={<span>导出页面JSON配置</span>}>
                <WalletTwoTone className={style.icons}/>
            </Tooltip>
        </a>
    </div>;
};

const OptionBoard = ({ optionInputHasFocus }) => {
    const { state, dispatch } = useContext(storeContext);
    const { tabIndex, choose, tree, menu } = state;
    const chooseObj = useRef();

    // 渲染面板配置列表
    const renderOption = useCallback(() => {
        // 没选中组件不显示面板
        if (!chooseObj.current) {
            return null;
        }
        // 面板操作类型，样式还是自定义属性
        const optionList = tabIndex === 0 ? initStylesItemArr : [
            {
                name: '开启懒加载',
                prop: 'lazy',
                type: 'switch',
                size: 'long'
            },
            ...menu[chooseObj.current.name].staticProps
        ];
        const optionName = tabIndex === 0 ? 'style' : 'props';

        return <div className={style.configWrap}>
            {
                optionList.map((item) => <div
                    className={[style.config, item.size === 'long' ? style.long : ''].join(' ')}
                    key={item.prop} key={item.prop}
                >
                    {renderItemByType(item, optionName)}
                </div>)
            }
        </div>;
    }, [menu, tree, choose, tabIndex]);

    const renderItemByType = useCallback(({ name, prop, type = 'text', option, mirrorValue }, optionName) => {
        const curValue = chooseObj.current[optionName][prop];

        switch (type) {
            case 'switch':
                var swtichValue;

                if (!mirrorValue) {
                    swtichValue = curValue;
                } else {
                    if (mirrorValue.init) {
                        swtichValue = mirrorValue.init;
                    }
                    for (let bool in mirrorValue) {
                        if (mirrorValue[bool] === curValue) {
                            // eslint-disable-next-line no-eval
                            swtichValue = eval(bool);
                        }
                    }
                }

                return <div className={style.longSwitch}>
                    <p>{name}</p>
                    <Switch checked={swtichValue}
                        onChange={(checked) => changeValue({ checked, mirrorValue }, prop, type)}
                    />
                </div>;
            case 'select':
                return  <>
                    <p>{name}</p>
                    <Select
                        value={curValue || ''}
                        onChange={(value) => changeValue(value, prop, type)}
                    >
                        {
                            option.map(({ value, label }) => <Option value={value} key={value}>{label}</Option>)
                        }
                    </Select>
                </>;
            case 'color':
                return  <>
                    <p>{name}
                        <Popover id="antd-colorPop" content={<SketchPicker
                            color={curValue}
                            onChangeComplete={(color) => changeValue(color.rgb, prop, type)}
                        />} trigger="click">
                            <span className={style.colorBlock}><i style={{ backgroundColor: curValue }}></i></span>
                        </Popover>
                    </p>
                    <Input value={curValue || ''}
                        onFocus={() => changeOptionInputHasFocus(true)}
                        onBlur={() => changeOptionInputHasFocus(false)}
                        onChange={(e) => changeValue(e, prop, 'text')}
                    />
                </>;
            default:
                return  <>
                    <p>{name}</p>
                    <Input value={curValue || ''}
                        onFocus={() => changeOptionInputHasFocus(true)}
                        onBlur={() => changeOptionInputHasFocus(false)}
                        onChange={(e) => changeValue(e, prop, type)}
                    />
                </>;
        }
    }, [menu, tree, choose, tabIndex]);

    const changeOptionInputHasFocus = useCallback((type) => {
        if (!type) {
            // 只有输入框失去焦点时才算完成编辑，记录一次当前tree到堆栈
            record.add(tree);
        }
        // 释放当前编辑输入框状态，开启撤销、恢复快捷键权限
        optionInputHasFocus.current = type;
    }, []);

    // 改变面板属性值的回调
    const changeValue = useCallback((dynamic, key, type) => {
        let value;

        if (type === 'text') {
            value = dynamic.target.value;
        } else if (type === 'select') {
            value = dynamic;
        } else if (type === 'switch') {
            const { checked, mirrorValue } = dynamic;

            if (!mirrorValue) {
                value = checked;
            } else {
                value = mirrorValue[checked.toString()];
            }
        } else if (type === 'color') {
            console.log(dynamic);
            const { r, g, b, a } = dynamic;

            value = `rgba(${r},${g},${b},${a})`;
        }
        const nextTree = searchTree(tree, choose, EnumEdit.change, { tabIndex, items: [{ key, value }] });

        dispatch({
            type: 'UPDATE_TREE',
            payload: nextTree
        });
    }, [tree, choose, tabIndex]);

    // 面板TAB切换
    const changeTab = useCallback((i) => {
        dispatch({
            type: 'EDIT_CHANGE_TABNAV',
            payload: Number(i)
        });
    }, []);

    const comp = useMemo(() => {
        chooseObj.current = searchTree(tree, choose, EnumEdit.choose);
        const content = choose && <Layout className={style.tabPane}>
            <p className={style.compName}>
                <span>{menu[chooseObj.current.name].name}({chooseObj.current.name})</span>
                <span>ID:{chooseObj.current.el.replace(/^wc/, '')}</span>
            </p>
            {renderOption()}
        </Layout>;

        return <Tabs activeKey={tabIndex.toString()} onChange={changeTab}>
            <TabPane tab={tab[0]} key="0">
                {content}
            </TabPane>
            <TabPane tab={tab[1]} key="1">
                {content}
            </TabPane>
        </Tabs>;
    }, [tree, choose, tabIndex]);

    return <>
        <Edit />
        <div className={style.opt}>
            {comp}
        </div>
    </>;
};

export default OptionBoard;
