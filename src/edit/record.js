/**
 * @description 历史操作记录管理
 */
class Record {
    stack = [];     // 记录成功触发编译的配置堆栈
    point = 0;      // 指针point指向当前展示存档

    // 增加记录
    add(tree) {
        this.stack.splice(this.point + 1);
        this.stack.push(JSON.parse(JSON.stringify(tree)));
        this.point = this.stack.length - 1;
        if (this.stack.length === 100) {
            this.stack.shift();
        }
    }

    // 撤销
    roll() {
        if (this.point > 0) {
            this.point--;
            const lastPageTree = this.stack[this.point];

            return lastPageTree;
        }
        return false;
    }

    // 恢复
    recover() {
        if (this.point < this.stack.length - 1) {
            this.point++;
            const lastPageTree = this.stack[this.point];

            return lastPageTree;
        }
        return false;
    }
}

export const record = new Record();