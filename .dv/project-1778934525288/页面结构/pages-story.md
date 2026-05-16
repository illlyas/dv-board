# 模板填空（wind-power-emerald-ops）

- **主标题**：智慧工厂运营驾驶舱

## 平台 Widget 槽位（→ widgets.json）

- **p0.chart.capacity**：title=产线产能对比；subtitle=各产线实际产出 vs 设计产能；xField=line；yFields=actual、capacity；store=已填
- **p0.chart.device_donut**：title=设备状态分布；subtitle=各运行状态设备数量占比；nameField=status；valueField=count；store=已填
- **p0.chart.hours_trend**：title=产量趋势；subtitle=当日每小时实际产量与计划产量对比；xField=hour；yFields=actual、plan；store=已填
- **p0.config.daily_orders**：store=已填
- **p0.config.gen_progress**：store=已填
- **p0.config.maintenance_metrics**：store=已填
- **p0.config.map_scatter**：store=已填
- **p0.config.production_base**：store=已填
- **p0.config.province_data**：store=已填
- **p0.config.transit_summary**：store=已填
- **p0.config.work_orders**：store=已填
- **p0.kpi.abnormal_orders**：title=异常订单数；subtitle=触发告警的异常工单数量；unit=个；store=已填
- **p0.kpi.availability**：title=设备可用率；subtitle=实际运行时间 / 计划运行时间；unit=%；store=已填
- **p0.kpi.capacity_rate**：title=产能利用率；subtitle=实际产出 / 设计产能；unit=%；store=已填
- **p0.kpi.clean_gen**：title=清洁能源占比；subtitle=可再生能源使用比例；unit=%；store=已填
- **p0.kpi.emission**：title=碳排放量；subtitle=生产过程CO₂排放累计；unit=吨CO₂；store=已填
- **p0.kpi.gen_day**：title=日产量；subtitle=当日累计生产总量；unit=件；store=已填
- **p0.kpi.gen_month**：title=月产量；subtitle=本月累计生产总量；unit=件；store=已填
- **p0.kpi.gen_year**：title=年产量；subtitle=年度累计生产总量；unit=件；store=已填
- **p0.kpi.mldt**：title=平均故障间隔；subtitle=平均无故障工作时间 (MTBF)；unit=小时；store=已填
- **p0.kpi.mttr**：title=平均修复时间；subtitle=平均故障修复时长 (MTTR)；unit=小时；store=已填
- **p0.kpi.plan_rate**：title=计划完成率；subtitle=实际产出 / 计划产出；unit=%；store=已填
- **p0.kpi.running_orders**：title=运行订单数；subtitle=当前在制工单数量；unit=个；store=已填
- **p0.kpi.util_hours**：title=利用时长；subtitle=平均设备每日运行时长；unit=小时；store=已填
- **p0.kpi.wind_farms**：title=车间数量；subtitle=当前在产车间总数；unit=个；store=已填
- **p0.kpi.wind_units**：title=设备总数；subtitle=全部在册设备数量；unit=台；store=已填
- **p1.chart.alarm_bar**：title=告警分类统计；subtitle=各类型告警发生次数；xField=type；yFields=count；store=已填
- **p1.chart.device_status**：title=设备状态占比；subtitle=当前各状态设备比例；nameField=status；valueField=count；store=已填
- **p1.chart.power_realtime**：title=实时功率监控；subtitle=全厂实时功率曲线；xField=time；yFields=power；store=已填
- **p1.chart.power_realtime_seed**：store=已填
- **p1.chart.wind_speed**：title=环境温度监测；subtitle=车间实时温度变化；xField=time；yFields=temp；store=已填
- **p1.chart.wind_speed_seed**：store=已填
- **p1.config.power_kpi**：store=已填
- **p1.config.wind_kpi**：store=已填
- **p1.table.alarm_list**：store=已填
- **p1.table.device_log**：store=已填

## 分区标题（→ slots.schema panelHeaders）

- **gen_completion**：产量完成情况
- **production_base**：生产基地概况
- **capacity**：产能对比
- **power_realtime**：实时功率监控
- **wind_speed**：环境温度监测
- **logistics**：智慧物流监控
- **maintenance**：设备运维监控
- **alarm_list**：实时告警列表
- **device_log**：设备运行日志