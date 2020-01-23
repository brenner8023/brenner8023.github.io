var $searchSubmit = document.querySelector('.search_submit'), // 搜索按钮
$searchInput = document.querySelector('.search_input'), // 搜索输入框
$container = document.querySelector('#container'), $wdList = document.getElementsByClassName('wd_list')[0], // 关键词提示列表
$wdItem = document.getElementsByClassName('wd_li'), // 每个关键词提示li
listOfSuggestion = [], // 存储返回回来的关键词提示数组
suggestionIndex = -1, // 关键词提示数组的当前索引
searchData = sessionStorage.getItem('searchData'), listOfSearchData = searchData == null ? [] : JSON.parse(searchData), listOfIframe = [
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
        listOfSuggestion = [];
        return;
    }
    var $script = document.createElement('script');
    $script.src = "https://suggestion.baidu.com/su?wd=" + encodeURIComponent(wd) + "&cb=window.baiduSug";
    document.head.appendChild($script);
    document.head.removeChild($script);
    // 发出jsonp请求，重置suggestionIndex
    suggestionIndex = -1;
}
window['baiduSug'] = function (data) {
    var tmpl = '', len = (data.s.length >= 0 && data.s.length < 6) ? data.s.length : 6;
    listOfSuggestion = data.s.slice(0, len);
    if (listOfSuggestion.length > 0) {
        for (var i = 0; i < len; i++) {
            tmpl += "<li class=\"wd_li\">" + listOfSuggestion[i] + "</li>";
        }
        $wdList.innerHTML = tmpl;
    }
};
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
    $searchInput.addEventListener('input', function (e) {
        jsonp(e.target.value);
    });
    // 输入框失去焦点时隐藏关键词提示列表
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
    $searchInput.addEventListener('keydown', function (e) {
        var len = listOfSuggestion.length;
        if (len == 0)
            return;
        if (e.keyCode == 38) { // 输入上方向键
            e.preventDefault();
            if (suggestionIndex >= 0)
                $wdItem[suggestionIndex].className = 'wd_li';
            suggestionIndex = (suggestionIndex == 0) ? len - 1 : suggestionIndex - 1;
            $wdItem[suggestionIndex].className = 'wd_li wd_active';
            $searchInput.value = $wdItem[suggestionIndex].innerText;
        }
        else if (e.keyCode == 40) { // 输入下方向键
            e.preventDefault();
            if (suggestionIndex >= 0)
                $wdItem[suggestionIndex].className = 'wd_li';
            suggestionIndex = (suggestionIndex == len - 1) ? 0 : suggestionIndex + 1;
            $wdItem[suggestionIndex].className = 'wd_li wd_active';
            $searchInput.value = $wdItem[suggestionIndex].innerText;
        }
    });
    document.addEventListener('click', function (e) {
        if ($wdList.contains(e.target))
            setHash(e.target.innerText);
        else if ($searchSubmit.contains(e.target))
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
