# SVG 编辑器 CLI · Lab1 Phase 1

高级软件开发技术课程作业。TypeScript 面向对象实现，包含六种内置图形、全部 19 条命令、嵌套组合树、撤销重做、SVG 保存读回及测试。

## 安装与运行

需要 **Node.js ≥ 22.18**。推荐用项目记录的 pnpm 版本安装（锁文件已提交）：

```sh
pnpm install --frozen-lockfile
pnpm run cli
```

也可以使用 npm：

```sh
npm install
npm run cli
```

运行后提示符为 `svg>`。输入 `help` 查看全部语法；`Ctrl-D` / 输入流结束退出。使用 npm 安装时会生成本机的 `package-lock.json`，项目的可复现依赖以 `pnpm-lock.yaml` 为准。

```text
init 400 200
create g flow
create rect start 30 70 120 60 #4a90d9 in flow
create line edge 150 100 250 100 black in flow
create rect end 250 70 120 60 #f5a623 in flow
tree
save demo.svg
```

用浏览器打开生成的 SVG 即可预览。

## 回放与验证

以下命令在工程根目录执行：

```sh
npm run cli < examples/flowchart.cli
npm run verify
```

没有 npm 时也可运行 `pnpm run verify` 或 `node --run verify`（安装依赖后）。验证会检查所有源码和测试的 TypeScript 类型、架构依赖、自动化测试，并构建到 `dist/`；构建产物可用 `node dist/cli/Main.js` 启动。

- [两节点流程图脚本](examples/flowchart.cli)、[生成的 SVG](examples/flowchart.svg)、[真实回放输出](examples/flowchart.transcript.txt)。
- [题目典型会话脚本](examples/session.cli)、[回放输出](examples/session.transcript.txt)。这个脚本故意包含两条错误命令，批处理退出码为 1；其余命令继续执行。
- [架构、设计模式、过程记录、一致性自查及质量保证](doc/README.md)。
- [PlantUML 源码](doc/architecture.puml)。

## 使用约定

id 唯一且区分大小写；有空格的文本和路径使用双引号。只忽略空行和整行 `#` 注释，颜色 `#fff` 不会被当作注释。引号内支持 `\"`、`\\`、`\n`、`\r`、`\t` 转义。错误均以 `error:` 开头，失败不改变文档、路径或历史。

文档命令 `init/read/save` 及带参数的 `canvas` 成功后清空并锁定 undo/redo，下一次成功编辑解锁；显示命令不干扰历史。根级 `g` 按题目要求拒绝 `ungroup`。`box` 属于后续阶段，本阶段报告未知类型。

## 目标仓库

<https://github.com/ooooomelodyoooo/lab1>
