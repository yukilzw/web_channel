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

const IsMacOS = navigator.platform.match('Mac');
const { TabPane } = Tabs;
const { Option } = Select;
const tab = ['页面设置', '样式', '属性'];
// 定义固有的样式属性配置项，后续可持续拓展（自定义属性配置项没有固有的，是根据每个组件JSON中staticProps动态渲染的）
const initStylesItemArr = require('./_style.json');
const initPageItemArr = require('./_page.json');

const TooltipProps = {
    mouseLeaveDelay: 0,
    placement: 'left'
};

const Edit = () => {
    const { state: {
        choose
    } } = useContext(storeContext);
    const { savePage, deleteNode, copeNode, pasteNode, cutNode, returnEdit, resumeEdit, changePosNode, copyCompEl } = useContext(EditFuncContext);
    const canReturnEdit = record.point > 0;
    const canResumeEdit = record.point < record.stack.length - 1;
    const canPaste = !!copyCompEl.current;

    const fillUnable = useCallback((can) => can ? undefined : style.unable);

    return <div className={style.edt}>
        <a onClick={savePage}>
            <Tooltip {...TooltipProps} title={<span>保存({IsMacOS ? 'Command' : 'Ctrl'}+S)</span>}>
                <FolderTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={canReturnEdit ? returnEdit : undefined} className={fillUnable(canReturnEdit)}>
            <Tooltip {...TooltipProps} title={<span>撤销({IsMacOS ? 'Command' : 'Ctrl'}+Z)</span>}>
                <LeftCircleTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={canResumeEdit ? resumeEdit : undefined} className={fillUnable(canResumeEdit)}>
            <Tooltip {...TooltipProps} title={<span>恢复({IsMacOS ? 'Command' : 'Ctrl'}+Y)</span>}>
                <RightCircleTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={choose ? deleteNode : undefined} className={fillUnable(choose)}>
            <Tooltip {...TooltipProps} title={<span>删除({IsMacOS ? '删除键' : 'DEL'})</span>}>
                <DeleteTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={choose ? copeNode : undefined} className={fillUnable(choose)}>
            <Tooltip {...TooltipProps} title={<span>复制({IsMacOS ? 'Command' : 'Ctrl'}+C)</span>}>
                <CopyTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={choose ? cutNode : undefined} className={fillUnable(choose)}>
            <Tooltip {...TooltipProps} title={<span>剪切({IsMacOS ? 'Command' : 'Ctrl'}+X)</span>}>
                <PieChartTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={canPaste ? pasteNode : undefined} className={fillUnable(canPaste)}>
            <Tooltip {...TooltipProps} title={<span>粘贴({IsMacOS ? 'Command' : 'Ctrl'}+V)</span>}>
                <SnippetsTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => choose && changePosNode(-1)} className={fillUnable(choose)}>
            <Tooltip {...TooltipProps} title={<span>上移节点(↑)</span>}>
                <UpSquareTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => choose && changePosNode(1)} className={fillUnable(choose)}>
            <Tooltip {...TooltipProps} title={<span>下移节点(↓)</span>}>
                <DownSquareTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a onClick={() => message.warn('请按住空格后拖动画布、鼠标滚轮')}>
            <Tooltip {...TooltipProps} title={<span>移动画布(Space+滚动+左键)</span>}>
                <EyeTwoTone className={style.icons}/>
            </Tooltip>
        </a>
        <a href="/template/page.json" download>
            <Tooltip {...TooltipProps} title={<span>导出页面JSON配置</span>}>
                <WalletTwoTone className={style.icons}/>
            </Tooltip>
        </a>
    </div>;
};

const OptionBoard = ({ optionInputHasFocus }) => {
    const { pid, state, dispatch } = useContext(storeContext);
    const { tabIndex, choose, page, tree, menu } = state;
    const chooseObj = useRef();

    // 渲染面板配置列表
    const renderOption = useCallback(() => {
        let optionList;
        let optionName;

        // 面板操作类型，样式还是自定义属性
        switch (tabIndex) {
            case 0:
                optionList = initPageItemArr;
                optionName = 0;
                break;
            case 1:
                optionList = initStylesItemArr;
                optionName = 'style';
                break;
            case 2:
                optionList = [
                    {
                        name: '开启懒加载',
                        prop: 'lazy',
                        type: 'switch',
                        size: 'long'
                    },
                    ...menu[chooseObj.current.name].staticProps
                ];
                optionName = 'props';
                break;
            default: return;
        }

        return <div className={style.configWrap}>
            {
                optionList.map((item) => <div
                    className={[style.config, item.size === 'long' ? style.long : ''].join(' ')}
                    key={item.prop}
                >
                    {renderItemByType(item, optionName)}
                </div>)
            }
        </div>;
    }, [menu, tree, choose, tabIndex, page]);

    const renderItemByType = useCallback(({ name, prop, type = 'text', option, mirrorValue }, optionName) => {
        let curValue;
        if (optionName === 0) {
            curValue = page[prop];
        } else {
            curValue = chooseObj.current[optionName][prop];
        }

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
    }, [menu, tree, choose, tabIndex, page]);

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

        if (tabIndex === 0) {
            dispatch({
                type: 'UPDATE_PAGE_INFO',
                payload: { [key]: value }
            });
        } else {
            const nextTree = searchTree(tree, choose, EnumEdit.change, { tabIndex, items: [{ key, value }] });

            dispatch({
                type: 'UPDATE_TREE',
                payload: nextTree
            });
        }
    }, [tree, choose, tabIndex, page]);

    // 面板TAB切换
    const changeTab = useCallback((i) => {
        dispatch({
            type: 'EDIT_CHANGE_TABNAV',
            payload: Number(i)
        });
    }, []);

    const comp = useMemo(() => {
        chooseObj.current = searchTree(tree, choose, EnumEdit.choose);
        const content = <Layout className={style.tabPane}>
            {
                tabIndex === 0 ? <p className={style.compName}>
                    <span>页面ID：{pid}</span>
                </p> : <p className={style.compName}>
                    <span>{menu[chooseObj.current.name].name}({chooseObj.current.name})</span>
                    <span>ID:{chooseObj.current.el.replace(/^wc/, '')}</span>
                </p>
            }
            {renderOption()}
        </Layout>;

        return <Tabs activeKey={tabIndex.toString()} onChange={changeTab}>
            {
                tab.map((tabText, i) => {
                    if (!choose && i > 0) {
                        return null;
                    }
                    return <TabPane tab={tabText} key={`${i}`}>
                        {content}
                    </TabPane>;
                })
            }
        </Tabs>;
    }, [tree, choose, tabIndex, page]);

    return <>
        <Edit />
        <div className={style.opt}>
            {comp}
        </div>
    </>;
};

export default OptionBoard;
