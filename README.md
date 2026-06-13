#2D战棋

一个简单的基于前端三剑客（HTML/CSS/JS）和 Spring Boot 的本地双人对战棋盘游戏。

## 项目简介

2D战棋是一款回合制策略棋盘游戏，支持两名玩家在同一台电脑上轮流对战。玩家可以选择不同的单位（坦克、士兵、战车）进行对抗，摧毁敌方基地即可获胜。

## 技术栈

### 后端
- Spring Boot
- MyBatis
- MySQL

### 前端
- HTML5
- CSS3
- JavaScript (ES6+)
- Vue.js

## 功能特性

- **地图生成**：支持自定义地图大小和地形比例（草地、山脉、湖泊、树木）
- **双人对战**：蓝方 vs 红方，本地双人对战模式
- **单位系统**：三种可战斗单位（坦克、士兵、战车）和基地
- **回合制**：玩家轮流行动，每回合可以移动和攻击
- **胜负判定**：摧毁敌方基地获胜
- **数据存储**：支持将胜利记录保存到后端数据库

## 项目结构

```
2d-battle-chess/
├── springboot/           # Spring Boot 后端项目
│   └── src/
│       └── main/
│           ├── java/com/springboot/
│           │   ├── controller/   # 控制器
│           │   ├── mapper/     # 数据访问层
│           │   ├── pojo/       # 实体类
│           │   └── service/    # 业务逻辑层
│           └── resources/      # 配置资源
│
└── work/                 # 前端项目
    ├── html/             # HTML页面
    ├── css/              # 样式文件
    ├── js/               # JavaScript逻辑
    └── res/              # 图片资源
        ├── backGround/  # 背景图片
        └── chess/       # 游戏棋子图片
```

## 快速开始

### 后端启动

1. 确保已安装 JDK 8+ 和 Maven
2. 配置 MySQL 数据库连接（修改 `springboot/src/main/resources/application.properties`）
3. 在 `springboot` 目录下执行：

```bash
mvn spring-boot:run
```

后端服务将运行在 `http://localhost:8080`

### 前端运行

1. 使用任意 Web 服务器（如 Live Server）或直接用浏览器打开 `work/html/game.html`

## 游戏玩法

### 1. 地图设置
- 设置地图大小（建议 10x10 到 20x20）
- 调整各类地形比例

### 2. 单位选择
- **坦克**：高攻击力，高血量，昂贵
- **士兵**：中等属性，性价比高
- **战车**：移动范围大，攻击范围广

### 3. 操作流程
1. 点击己方单位选中
2. 点击目标格子移动或攻击
3. 点击"结束回合"切换玩家

### 4. 获胜条件
摧毁敌方基地即可获得胜利。

## 许可证

本项目仅供学习交流使用。
