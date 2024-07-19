// 屏幕分辨率及控制台设置
width = device.width;
height = device.height;
var x = width / 2;
var y = height / 2;
console.show(true);
console.warn("===检测屏幕分辨率===");
randomSleep(2000, 3000);
console.info("屏幕分辨率为%s * %s", width, height);
setScreenMetrics(width, height);

// 主运行函数
function run() {
    let appName = selectApp();
    if (!appName) return;
    killApp(appName);
    randomSleep(2000, 3000);
    if (!launchApp(appName)) {
        let launchAppName = getPackageName(appName);
        log("获取对应包名" + launchAppName);
        if (!app.launch(launchAppName)) {
            log("打开" + appName + "失败,脚本关闭");
            exit();
        }
    }

    go(appName);
}

// 选择软件类型
function selectApp() {
    var appNames = ["抖音", "抖音极速版", "抖音火山版"];
    var i = dialogs.select("请选择哪个版本", appNames);
    if (i >= 0) {
        log("您选择的是" + appNames[i]);
        return appNames[i];
    } else {
        log("您退出了选择");
        exit();
    }
}

// 启动应用并检测
function launchApp(appName) {
    console.warn("===程序开始===");
    console.warn("===启动" + appName + "===");
    randomSleep(2000, 3000);
    let launched = app.launchApp(appName);
    if (launched) {
        log("打开" + appName + "成功");
        randomSleep(10000, 20000);
        return true;
    } else {
        log("打开" + appName + "失败,自动关闭");
        exit();
    }
}

// 循环刷视频任务
function go(appName) {
    console.warn("===开始循环任务===");
    var i = 0;
    let num = random(80, 150);
    let totalCount = 0;
    log("本次循环次数为：" + num + "次");

    while (i < num) {
        var start1 = new Date().getTime();
        randomSleep(1000, 3000);

        // 弹窗函数执行
        dytanchuang();
        randomSleep(1000, 3000);

        //检测首页，防止不知道点哪去了
        if (measureExecutionTime(isHomePageExist, "检测首页")) {
        } else {
            console.error("未检测到首页, 结束运行");
            exit();
        }
        randomSleep(1000, 3000);

        //检测直播间
        if (measureExecutionTime(isLive, "检测直播间")) {
            console.error("===跳出当前循环，重新运行===")
            continue;
        }
        randomSleep(1000, 3000);

        //判断是否有广告，确保可行性但效率不高，放置点赞时检测
        if (measureExecutionTime(handleAds, "检测广告")) {
            console.error("===跳出当前循环，重新运行===")
            continue;
        }
        randomSleep(1000, 3000);

        // 检测广告
        if (measureExecutionTime(detectAd, "检测其他广告")) {
            console.error("===跳出当前循环，重新运行===")
            continue;
        }
        randomSleep(1000, 3000);

        // 随机点赞
        if (i % random(4, 5) === 0 && i !== 0) {
            totalCount++;
            console.info("执行随机点赞：" + totalCount);
            randomSleep(1000, 3000);
            performLike();

        }
        //随机等待时间
        console.warn("===随机等待时间===");
        randomSleep(5000, 15000, "随机等待时间:");



        // 随机往回看
        if (i >= 2 && random(1, 50) <= 2) {
            watchPreviousVideos(random(1, 2));
        } else {
            swipeNextVideo();
        }

        i++;
        log("总次数：" + num + ",执行次数：" + i);
        var end1 = new Date().getTime();
        console.info(`第` + i + `次循环耗时: ${(end1 - start1) / 1000} 秒`);
    }
    console.warn("===循环任务结束===");
    killApp(appName);
    exit();
}

// 清理后台应用
function killApp(appName) {
    console.warn("===清理" + appName + "后台===");
    randomSleep(2000, 3000);
    recents();
    randomSleep(2000, 3000);
    var isExistDesc = text(appName).exists();
    if (!isExistDesc) {
        console.error("后台不存在，返回主页");
        home();
        return;
    }
    var descLoc = text(appName).findOne().bounds();
    swipe(descLoc.centerX(), descLoc.centerY() + 200, device.width, descLoc.centerY(), 300);
    randomSleep(2000, 3000);
    home();
    randomSleep(2000, 3000);
}

// 通用的计时函数
function measureExecutionTime(fn, label) {
    var start = new Date().getTime();
    var result = fn();
    var end = new Date().getTime();
    console.verbose(`${label}: ${(end - start) / 1000} 秒`);
    return result;

}
// 处理弹窗
function dytanchuang() {
    console.warn("===检测弹窗===");
    measureExecutionTime(closeFirstPageAd, "首屏广告");
    measureExecutionTime(closeUpdatePopup, "软件更新");
    measureExecutionTime(closeYouthMode, "青少年模式");
    measureExecutionTime(closeCommentAtmosphere, "共建抖音评论氛围");
    measureExecutionTime(closeFindTelFriends, "访问你的通讯录");
    measureExecutionTime(closeRecommentMoreLive, "为你推荐更多主播");
    measureExecutionTime(closeRecommentFriends, "朋友推荐");
    measureExecutionTime(closeSetNickName, "设置昵称和头像");
}

// 首屏广告
function closeFirstPageAd() {
    if (desc("跳过广告").exists()) {
        console.info("发现首屏广告");
        desc("跳过广告").click();
        log("跳过首屏广告完成");
        sleep(1000);
    }
}

// 更新检测弹窗
function closeUpdatePopup() {
    if (text("检测到更新").exists()) {
        console.info("发现软件更新弹窗");
        click("以后再说");
        log("关闭更新弹窗完成");
        sleep(1000);
    }
}

// 青少年模式弹窗
function closeYouthMode() {
    if (text("开启青少年模式").exists()) {
        console.info("发现青少年模式弹窗");
        click("关闭");
        log("关闭青少年模式弹窗完成");
        sleep(1000);
    }
}

// 共建抖音评论氛围弹窗
function closeCommentAtmosphere() {
    if (text("共建抖音评论氛围").exists()) {
        console.info("发现 共建抖音评论氛围 弹窗");
        click("好的");
        log("关闭 共建抖音评论氛围 弹窗完成");
        sleep(1000);
    }
}

// 访问你的通讯录弹窗
function closeFindTelFriends() {
    if (text("抖音 想访问你的通讯录").exists()) {
        console.info("发现 访问你的通讯录 弹窗");
        click("拒绝");
        log("关闭 访问你的通讯录 弹窗完成");
        sleep(1000);
    }
}

// 直播间-为你推荐更多主播
function closeRecommentMoreLive() {
    if (text("为你推荐更多主播").exists()) {
        console.info("发现 为你推荐更多主播 弹窗");
        click("退出");
        log("关闭 为你推荐更多主播 弹窗完成");
        sleep(1000);
    }
}

// 朋友推荐
function closeRecommentFriends() {
    if (text("朋友推荐").exists()) {
        console.info("发现 朋友推荐 弹窗");
        desc("关闭").click();
        log("关闭 朋友推荐 弹窗完成");
        sleep(1000);
    }
}

// 设置昵称和头像
function closeSetNickName() {
    if (text("设置昵称和头像，更好地表达你的意见").exists()) {
        console.info("发现 设置昵称和头像 弹窗");
        desc("关闭").click();
        log("关闭 设置昵称和头像 弹窗完成");
        sleep(1000);
    }
}

// 判断是否是直播间
function isLive() {
    console.warn("===检测直播间===");
    if (desc("点击进入直播间按钮").visibleToUser().exists()) {
        console.info("发现直播间：执行跳过");
        swipeNextVideo();
        return true;
    }
    return false;
}

// 处理广告
function handleAds() {
    console.warn("===检测广告===");
    if (className("android.widget.TextView").textContains("广告").visibleToUser().exists()) {
        console.info("发现广告：执行跳过");
        swipeNextVideo();
        return true;//传递给go 
    }
}

function detectAd() {
    // 第一个判断条件
    if (text("上滑继续看视频").visibleToUser().exists()) {
        console.info("发现 (上滑继续看视频), 执行跳过");
        swipeNextVideo();
        return true; // 终止函数执行，返回 true
    }
    
    // 第二个判断条件
    if (className("android.widget.Button").text("点击重播").visibleToUser().exists()) {
        console.info("发现 (点击重播), 执行跳过");
        swipeNextVideo();
        return true; // 终止函数执行，返回 true
    }
}




// 检测是否存在 "首页"
function isHomePageExist() {
    console.warn("===检测首页===");
    if (text("首页").exists()) {
        return true;
    }
}

// 随机数
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// 随机延迟并打印
function randomSleep(min, max, text) {
    let t = random(min, max);
    console.verbose((text || "随机延迟：") + t / 1000 + " 秒");
    sleep(t);
}

// 执行点赞操作
function performLike() {
    let z = random(1, 30);
    click(x - z, y - z);
    randomSleep(40, 80);
    click(x - z, y - z);
    randomSleep(40, 80);
}

// 往回看视频
function watchPreviousVideos(count) {
    for (let j = 0; j < count; j++) {
        log("开始往回看第" + (j + 1) + "个视频");
        swipe(device.width / 2, device.height * (1 / 4), device.width / 2, device.height * (8 / 9), 150);
        randomSleep(5000, 20000, "往回看第" + (j + 1) + "个视频，随机延迟：");
    }
}

// 刷下一个视频
function swipeNextVideo() {
    swipe(device.width / 2, device.height / 2, device.width / 2, 0, 300);
}


// 启动脚本
run();
