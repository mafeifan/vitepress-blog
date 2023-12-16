### 基础
Linux中，系统在启动一个进程的同时会为该进程打开三个文件：标准输入（stdin）、标准输出（stdout）和标准错误输出（stderr），分别用
文件标识符0，1，2来标识。如果要为进程打开其他的输入输出，则需要从整数3开始标识。默认情况下，标准输入为键盘，标准输出和错误输出为显示器。

输入输出可以重定向，如 `ls -l` 会在显示器上看到结果，为了将结果输出到文件中，可以改为 `ls -l /user > result.txt`
如果ls命令后面跟的指定文件不存在呢？
标准输出覆盖重定向(>) 其实是默认将文件标识符为1的内容重定向到指定文件中，所以下面两种写法等价
```
ls -l /user > result.txt
ls -l /user 1 > result.txt
```
可以通过指定将文件标识符为2的内容重定向到指定文件，这样错误输出就不会出现在显示器上。
`ls -l /noExist 2 > no_exist_result.txt`

#### 标识输出重定向 >&
将一个标准的输出重定向到另一个标识的输入。
如果想要将标准输出和标准错误同时定向到同一个文件，可使用下面命令
`COMMAND > stout_stderr.txt 2 > &1`
举例：
`find / -type f -name *.txt` 会报权限问题，如果使用`find / -type f -name *.txt > result.txt` 只能将标准输出重定向到result文件，
错误输出依然会出现在显示器上，使用 `find / -type f -name *.txt 2 > &1` 可避免类似问题

而且不需要记录错误记录，可以将错误输出到'黑洞'里，常见的是 `nohup command >/dev/null 2>&1 &`



### 参考
[Linux里的2>&1究竟是什么](https://blog.csdn.net/GGxiaobai/article/details/53507530)

[https://jenkins.io/doc/pipeline/steps/workflow-durable-task-step/#-sh-%20shell%20script](https://jenkins.io/doc/pipeline/steps/workflow-durable-task-step/#-sh-%20shell%20script)


### `sh`: Shell Script[](https://jenkins.io/doc/pipeline/steps/workflow-durable-task-step/#sh-shell-script)

*   `script`

    Runs a Bourne shell script, typically on a Unix node. Multiple lines are accepted.

    An interpreter selector may be used, for example:`#!/usr/bin/perl`

    Otherwise the system default shell will be run, using the`-xe`flags (you can specify`set +e`and/or`set +x`to disable those).

    *   **Type:**`String`
*   `encoding`(optional)

    Encoding of process output. In the case of`returnStdout`, applies to the return value of this step; otherwise, or always for standard error, controls how text is copied to the build log. If unspecified, uses the system default encoding of the node on which the step is run. If there is any expectation that process output might include non-ASCII characters, it is best to specify the encoding explicitly. For example, if you have specific knowledge that a given process is going to be producing UTF-8 yet will be running on a node with a different system encoding (typically Windows, since every Linux distribution has defaulted to UTF-8 for a long time), you can ensure correct output by specifying:`encoding: 'UTF-8'`

    *   **Type:**`String`
*   `label`(optional)

    Label to be displayed in the pipeline step view and blue ocean details for the step instead of the step type. So the view is more meaningful and domain specific instead of technical.

    *   **Type:**`String`
*   `returnStatus`(optional)

    Normally, a script which exits with a nonzero status code will cause the step to fail with an exception. If this option is checked, the return value of the step will instead be the status code. You may then compare it to zero, for example.

    *   **Type:**`boolean`
*   `returnStdout`(optional)

    If checked, standard output from the task is returned as the step value as a`String`, rather than being printed to the build log. (Standard error, if any, will still be printed to the log.) You will often want to call`.trim()`on the result to strip off a trailing newline.


