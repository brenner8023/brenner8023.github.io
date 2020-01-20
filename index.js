var $searchSubmit = document.querySelector('.search_submit'), $searchInput = document.querySelector('.search_input'), $container = document.querySelector('#container'), $wdList = document.getElementsByClassName('wd_list')[0], wdListIndex = 0, searchData = sessionStorage.getItem('searchData'), listOfSearchData = searchData == null ? [] : JSON.parse(searchData), listOfIframe = [
    {
        name: 'dogedoge',
        src: function (wd) { return "https://www.dogedoge.com/results?q=" + encodeURIComponent(wd); }
    },
    {
        name: 'baidu',
        src: function (wd) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(wd); }
    },
    {
        name: '极客搜索',
        src: function (wd) { return "https://s.geekbang.org/search/c=0/k=" + encodeURIComponent(wd) + "/t="; }
    },
    {
        name: '思否',
        src: function (wd) { return "https://segmentfault.com/search?q=" + encodeURIComponent(wd); }
    },
    {
        name: '掘金',
        src: function (wd) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(wd) + "%20site%3Ajuejin.im"; }
    },
    {
        name: '博客园',
        src: function (wd) { return "https://zzk.cnblogs.com/s/blogpost?w=" + encodeURIComponent(wd); }
    },
    {
        name: '知乎',
        src: function (wd) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(wd) + "%20site%3Azhihu.com"; }
    },
    {
        name: '简书',
        src: function (wd) { return "https://www.baidu.com/s?wd=" + encodeURIComponent(wd) + "%20site%3Ajianshu.com"; }
    },
    {
        name: '头条',
        src: function (wd) { return "https://www.toutiao.com/search/?page=1&num=10&keyword=" + encodeURIComponent(wd); }
    }
];
/**
 * 初始化
 */
function init() {
    changeIframe();
}
/**
 * jsonp请求百度api，返回智能提示的关键词
 * @param wd 用户输入的关键词
 */
function jsonp(wd) {
    if (wd == '') {
        $wdList.innerHTML = '';
        return;
    }
    var $script = document.createElement('script');
    window['baiduSug'] = function (data) {
        var tmpl = '', len = (data.s.length >= 0 && data.s.length < 6) ? data.s.length : 6;
        if (data.s.length > 0) {
            for (var i = 0; i < len; i++) {
                tmpl += "<li class=\"wd_li\">" + data.s[i] + "</li>";
            }
            $wdList.innerHTML = tmpl;
        }
    };
    $script.src = "https://suggestion.baidu.com/su?wd=" + encodeURIComponent(wd) + "&cb=window.baiduSug";
    document.head.appendChild($script);
    document.head.removeChild($script);
}
/**
 * 根据输入的关键词替换生成对应的iframe
 * @param wd 用户输入的关键词
 */
function changeIframe(wd) {
    if (wd === void 0) { wd = 'vue'; }
    var tmpl = '', className = '';
    listOfIframe.forEach(function (item, index) {
        className = (index >= 4 && index <= 6) ? 'col-3' : 'col-2';
        tmpl += "<iframe class=\"" + className + "\" src=\"" + item.src(wd) + "\" frameborder=\"0\"></iframe>";
    });
    $container.innerHTML = tmpl;
}
/**
 * 根据用户输入的关键词生成对应的时间戳，时间戳作为location.hash
 * @param value 用户输入的关键词
 */
function setHash(value) {
    var hashCode = (+new Date()).toString();
    listOfSearchData.push({
        hashCode: hashCode,
        wd: value
    });
    sessionStorage.setItem('searchData', JSON.stringify(listOfSearchData));
    window.location.hash = hashCode;
    return hashCode;
}
/**
 * 主函数
 */
function main() {
    init();
    $searchInput.addEventListener('keyup', function (e) {
        if (e.keyCode != 13) {
            jsonp(e.target.value);
        }
        else {
            setHash(e.target.value);
        }
    });
    $searchInput.addEventListener('blur', function () {
        if (!$wdList.hidden)
            setTimeout(function () {
                $wdList.hidden = true;
            }, 200);
    });
    $searchInput.addEventListener('focus', function () {
        if ($wdList.hidden)
            $wdList.hidden = false;
    });
    $wdList.addEventListener('click', function (e) {
        setHash(e.target.innerText);
    });
    $searchSubmit.addEventListener('click', function (e) {
        setHash($searchInput.value);
    });
    window.addEventListener('hashchange', function () {
        var hashCode = window.location.hash.slice(1);
        listOfSearchData.forEach(function (item) {
            if (item.hashCode == hashCode) {
                changeIframe(item.wd);
                $searchInput.value = item.wd;
            }
        });
    });
}
main();
