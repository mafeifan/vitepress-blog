参考[官网文档](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/enabling-debug-logging)

如果需要开启runner的运行日志，只需要在settings中添加一对secret，key为`ACTIONS_RUNNER_DEBUG`，值为true
如果需要开启step的运行日志，只需要在settings中添加一对secret，key为`ACTIONS_STEP_DEBUG`，值为true

下图开启debug前后的输出信息对比

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20201118133259.png)

另外在action运行中会带有一些诸如执行环境，当前job，当前runner，当前仓库，执行用户等上下文变量。
想查看都有哪些集具体的变量可以加入steps

```
    steps:
      - name: Dump GitHub context
        env:
          GITHUB_CONTEXT: ${{ toJson(github) }}
        run: echo "$GITHUB_CONTEXT"
      - name: Dump job context
        env:
          JOB_CONTEXT: ${{ toJson(job) }}
        run: echo "$JOB_CONTEXT"
      - name: Dump steps context
        env:
          STEPS_CONTEXT: ${{ toJson(steps) }}
        run: echo "$STEPS_CONTEXT"
      - name: Dump runner context
        env:
          RUNNER_CONTEXT: ${{ toJson(runner) }}
        run: echo "$RUNNER_CONTEXT"
      - name: Dump strategy context
        env:
          STRATEGY_CONTEXT: ${{ toJson(strategy) }}
        run: echo "$STRATEGY_CONTEXT"
      - name: Dump matrix context
        env:
          MATRIX_CONTEXT: ${{ toJson(matrix) }}
        run: echo "$MATRIX_CONTEXT"
```
