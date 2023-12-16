containerd是一个工业级标准的容器运行时，它强调简单性、健壮性和可移植性。

containerd可以在宿主机中管理完整的容器生命周期，包括容器镜像的传输和存储、容器的执行和管理、存储和网络等。

Docker vs containerd

containerd是从Docker中分离出来的一个项目，可以作为一个底层容器运行时，现在它成了Kubernete容器运行时更好的选择。

不仅仅是Docker，还有很多云平台也支持containerd作为底层容器运行时。

K8S发布CRI（Container Runtime Interface），统一了容器运行时接口，凡是支持CRI的容器运行时，皆可作为K8S的底层容器运行时。

K8S为什么要放弃使用Docker作为容器运行时，而使用containerd呢？

如果你使用Docker作为K8S容器运行时的话，kubelet需要先要通过dockershim去调用Docker，再通过Docker去调用containerd。


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ab155063cdb4e55a7371d975866742b~tplv-k3u1fbpfcp-watermark.image)

如果你使用containerd作为K8S容器运行时的话，由于containerd内置了CRI插件，kubelet可以直接调用containerd。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec64b04beb174263894b6991f356b348~tplv-k3u1fbpfcp-watermark.image)

使用containerd不仅性能提高了（调用链变短了），而且资源占用也会变小（Docker不是一个纯粹的容器运行时，具有大量其他功能）。

containerd不支持docker API和docker CLI，可以通过cri-tool实现类似的功能。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e22536cd8be14981b91ac0229938a437~tplv-k3u1fbpfcp-watermark.image)

镜像相关功能对比


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/78a1af12d6c8457885d513516cf94aef~tplv-k3u1fbpfcp-watermark.image)
