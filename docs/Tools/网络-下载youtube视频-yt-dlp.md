youtube上有些视频还是不错的，比如我关注的小马技术，还开通了三级会员，我想把他讲的不错的列表视频下载下来保存。

github上面找到了这个不错的工具[yt-dlp](https://github.com/yt-dlp/yt-dlp)

他是基于大名鼎鼎的[youtube-dl](https://github.com/ytdl-org/youtube-dl)又额外添加了些功能。

## 前提

本地安装并开启代理,比如Clash,暴露代理地址,比如`socks5://127.0.0.1:7890`

## 会自动当列表下载
yt-dlp https://www.youtube.com/watch?v=MXdFMjm3vTs&list=PLliocbKHJNwslcXWGhQ7oaQSmw-MzLaXu&index=2 --proxy socks5://127.0.0.1:7890

## 先加--simulate尝试下载
yt-dlp --simulate https://www.youtube.com/watch?v=MXdFMjm3vTs --cookies-from-browser edge --proxy socks5://127.0.0.1:7890

## 下载付费课程

前提你可以正常播放该视频

yt-dlp https://www.youtube.com/watch?v=MXdFMjm3vTs --cookies-from-browser chrome --proxy socks5://127.0.0.1:7890

## 追加播放列表序号

![](https://pek3b.qingstor.com/hexo-blog/20220304160239.png)

yt-dlp --verbose  -o "%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s" "https://www.youtube.com/playlist?list=PLliocbKHJNwvBSh4DeBDHgq_8xINNzrt4" --cookies-from-browser chrome --proxy socks5://127.0.0.1:7890 --extractor-args youtubetab:skip=authcheck
