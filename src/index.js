/**
 * face By 郑斌 <wb-zhengbin@alipay.com>@alipay.com
 * Created By Anima
 */
seajs.config({
    alias:{
        zepto: "anima-yocto/1.1.0/index",
        alibridge: "anima-bridge/1.0.0/AP"
    }
});
seajs.use(['zepto', 'alibridge'], function($, Ali){
    // TODO 临时弹幕
    var Barrage = {
        colors: ['#3689c3', '#b96121', '#a8506b', '#e73357'],
        rows: [0, 0, 0, 0],
        maxRow: 0,
        elements:{
            ul: $('.barrage-wrap ul'),
            li: $('.barrage-wrap li')
        },
        init: function(e){
            this.render();
            this.run();
        },
        render: function(e){
            var that = this;

            that.elements.li.each(function(){
                var me = $(this),
                    index = me.index() % 4,
                    left = that.rows[index] + Math.floor(Math.random() * 50);

                me.css({
                    'color': that.colors[Math.floor(Math.random() * that.colors.length)],
                    'top': index * 36,
                    'left': left
                });

                that.rows[index] = left + me.width() + 20;
            });

            that.maxRow = Math.max.apply(null, that.rows);

            that.elements.ul.css({
                'width': that.maxRow
            });
        },
        run: function(e){
            var that = this;
            var movePx = $(window).width();
            var timer = setInterval(function(){
                if(movePx <= $(window).width() - that.elements.ul.width()) {
                    clearInterval(timer);
                    $('.btn-go').show();
                }
                that.elements.ul.css('-webkit-transform',  'translate3d('+ (movePx -= 0.8) + 'px, 0, 0px)');
            },10);
        }
    };

    Barrage.init();

    // 对比参考数据
    var analyzeData = [
        {
            result: '余额宝为毛最多只能存100万啊',
            moneyMin: 400e+4,
            moneyMax: 550e+4,
            starUrl: './static/images/stars/01.jpg'
        },
        {
            result: '这片鱼塘被我承包了',
            moneyMin: 1500e+4,
            moneyMax: 2500e+4,
            starUrl: './static/images/stars/02.jpg'
        },
        {
            result: '下一个马云',
            moneyMin: 6500e+4,
            moneyMax: 8500e+4,
            starUrl: './static/images/stars/03.jpg'
        },
        {
            result: '致富基本靠想',
            moneyMin: 3500e+4,
            moneyMax: 4500e+4,
            starUrl: './static/images/stars/04.jpg'
        },
        {
            result: '今天对我爱搭不理，明天让你高攀不起',
            moneyMin: 550e+4,
            moneyMax: 650e+4,
            starUrl: './static/images/stars/05.jpg'
        },
        {
            result: '高富帅团成员之一',
            moneyMin: 650e+4,
            moneyMax: 750e+4,
            starUrl: './static/images/stars/06.jpg'
        },
        {
            result: '极高的考古价值',
            moneyMin: 850e+4,
            moneyMax: 950e+4,
            starUrl: './static/images/stars/07.jpg'
        },
        {
            result: '看到这张脸想不想投币？',
            moneyMin: 750e+4,
            moneyMax: 850e+4,
            starUrl: './static/images/stars/08.jpg'
        },
        {
            result: '如果有钱是一种罪，那我一定罪恶滔天',
            moneyMin: 2500e+4,
            moneyMax: 3500e+4,
            starUrl: './static/images/stars/09.jpg'
        },
        {
            result: '不在乎朋友有没有钱，反正都没我有钱',
            moneyMin: 4500e+4,
            moneyMax: 5500e+4,
            starUrl: './static/images/stars/10.jpg'
        },
        {
            result: '国民女神（jing）',
            moneyMin: 950e+4,
            moneyMax: 1500e+4,
            starUrl: './static/images/stars/11.jpg'
        },
        {
            result: '被这张面容姣好的脸感动了',
            moneyMin: 850e+4,
            moneyMax: 950e+4,
            starUrl: './static/images/stars/12.jpg'
        },
        {
            result: '据说这是支付宝钱包最有钱头像之一',
            moneyMin: 5500e+4,
            moneyMax: 6500e+4,
            starUrl: './static/images/stars/13.jpg'
        },
        {
            result: '轻纱白衣，似身在烟雾，面容秀美绝俗',
            moneyMin: 2500e+4,
            moneyMax: 3500e+4,
            starUrl: './static/images/stars/14.jpg'
        },
        {
            result: '此脸价值已超过上限，系统已崩溃',
            moneyMin: '不可限量',
            moneyMax: '不可限量',
            starUrl: './static/images/stars/15.jpg'
        },
        {
            result: '对不起我们识别不到你的脸！绝对不是你的长相问题！',
            moneyMin: null,
            moneyMax: null,
            starUrl: './static/images/stars/16.jpg'
        }
    ];

    //头像地址
    var headImgUrl = '';

    // 保存数据
    var postData = {
        userId: 'userId123213',
        campId: 'campId123213',
        tempMap: {
            result: '此脸价值已超过上限，系统已崩溃 恩恩',
            money: '31221323123',
            percent: '66.00%',
            starUrl: 'photo.jpg'
        },
        headImg: 'data:image/jpeg;base64'
    };

    // GO按钮绑定事件
    $('.btn-go').tap(function(e){
        e.stopPropagation();
        var image = document.getElementById('photo');

        if(localStorage && localStorage.isGo === 'true') {
            headImgUrl = localStorage.headImgUrl;
            postData.tempMap = JSON.parse(localStorage.tempMap);

            renderResultPage(postData);

            return false;
        }

        // 拍照接口
        Ali.photo({
            dataType: 'dataURL',
            imageFormat: 'jpg',
            quality: 75,
            maxWidth: 500,
            maxHeight: 500,
            allowEdit: true
        }, function(result) {
            if(result.dataURL && result.dataURL.length > 0) {
                image.src = result.dataURL;
                $('.page1').hide();
                $('.page2').show();

                analyzing(result.dataURL);
                setTimeout(showResultPage, 5000);
            }
        });
    });

    // 分享按钮绑定事件
    $('.btn-share').tap(function(e){
        e.stopPropagation();
        Ali.share({
            'channels': [{
                name: 'Weibo', //新浪微博
                param: {
                    title: '分享的标题',
                    content: '分享的内容，不能超过140',
                    imageUrl: '分享的图片地址',
                    captureScreen: true, //分享当前屏幕截图(和imageUrl同时存在时，优先imageUrl)
                    url: 'http://alipay.com' //分享跳转的url，当添加此参数时，分享的图片大小不能超过32K
                }
            }, {
                name: 'LaiwangContacts', //来往好友
                param: {
                    title: '分享的标题',
                    content: '分享的内容',
                    imageUrl: '分享的图片地址',
                    captureScreen: true,
                    url: 'http://alipay.com'
                }
            }, {
                name: 'SMS', //短信
                param: {
                    content: '短信内容',
                    //应业务方需求定制功能
                    contentType: 'url',
                    extData:''
                }
            }, {
                name: 'CopyLink', //复制链接
                param: {
                    url: 'http://m.alipay.com'
                }
            }]
        },function(result){
        });
    });

    // 分析数据保存头像
    function analyzing(headImgDataUrl) {
        var resultData = analyzeData[Math.floor(Math.random() * 16)];

        postData.headImg = headImgDataUrl || headImgUrl;
        postData.tempMap = {
            result: resultData.result,
            money: resultData.moneyMax === '不可限量' ? '不可限量' : getMoney(resultData.moneyMin, resultData.moneyMax),
            percent: getPercent(50, 79.35),
            starUrl: resultData.starUrl
        };
        renderResultPage(postData);
        // 提交数据
        $.ajax({
            url: './src/mock.json',
            type: 'POST',
            data: postData,
            dataType: 'json',
            success: function(data){
                // 获取头像地址 data.userHeadImgPath
                headImgUrl = data.userHeadImgPath;
                $('.userImg img').attr('src', headImgUrl);

                localStorage.isGo = 'true';
                localStorage.headImgUrl = headImgUrl;
                localStorage.tempMap = JSON.stringify(postData.tempMap);
            }
        });
    }

    // 渲染对比结果
    function renderResultPage(postData) {
        var userImg = $('.userImg img'),
            starImg =  $('.starImg img'),
            percent = $('.result-percent span'),
            money =  $('.result-money'),
            result = $('.result-description');

        userImg.attr('src', headImgUrl || postData.headImg);
        starImg.attr('src', postData.tempMap.starUrl);
        percent.html(postData.tempMap.percent);
        money.html((postData.tempMap.money + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,'));
        result.html(postData.tempMap.result);
    }

    // 显示对比结果
    function showResultPage() {
        $('.page2').hide();
        $('.page3').show();
        $('body').addClass('contrast-page');
    }

    // util 随机相似度  50 ~ 79.35
    function getPercent(min, max){
        var range = max - min;
        return (Math.random() * range + min).toFixed(2) + '%';
    }

    // 随机金额
    function getMoney(min, max){
        if(max && min) {
            var range = max - min;
            return Math.floor(Math.random() * range  + min);
        } else {
            return ''
        }
    }
});
