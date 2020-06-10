import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {GeneralAnalysis, InputPipelineAnalysis} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {SummaryInfo} from 'org_xprof/frontend/app/common/interfaces/summary_info';

const GENERIC_SUMMARY_INFO = [
  {
    title: 'All Others Time',
    avg: 'other_time_ms_avg',
    sdv: 'other_time_ms_sdv',
  },
  {
    title: 'Compilation Time',
    avg: 'compile_time_ms_avg',
    sdv: 'compile_time_ms_sdv',
  },
  {
    title: 'Output Time',
    avg: 'outfeed_time_ms_avg',
    sdv: 'outfeed_time_ms_sdv',
  },
  {
    title: 'Input Time',
    avg: 'infeed_time_ms_avg',
    sdv: 'infeed_time_ms_sdv',
  },
  {
    title: 'Kernel Launch Time',
    avg: 'kernel_launch_time_ms_avg',
    sdv: 'kernel_launch_time_ms_sdv',
  },
  {
    title: 'Host Compute Time',
    avg: 'host_compute_time_ms_avg',
    sdv: 'host_compute_time_ms_sdv',
  },
  {
    title: 'Device to Device Time',
    avg: 'device_to_device_time_ms_avg',
    sdv: 'device_to_device_time_ms_sdv',
  },
  {
    title: 'Device Compute Time',
    avg: 'device_compute_time_ms_avg',
    sdv: 'device_compute_time_ms_sdv',
  },
];

/** A performance summary view component. */
@Component({
  selector: 'performance-summary',
  templateUrl: './performance_summary.ng.html',
  styleUrls: ['./performance_summary.scss']
})
export class PerformanceSummary implements OnChanges {
  /** The general anaysis data. */
  @Input() generalAnalysis?: GeneralAnalysis;

  /** The input pipeline analyis data. */
  @Input() inputPipelineAnalysis?: InputPipelineAnalysis;

  /** The summary info to be displayed first. */
  @Input() firstSummaryInfo: SummaryInfo[] = [];

  /** The addition property values from parent component. */
  @Input() propertyValues?: string[];

  title = 'Performance Summary';
  isTpu = true;
  summaryInfoAfter: SummaryInfo[] = [];
  summaryInfoBefore: SummaryInfo[] = [];
  mxuUtilizationPercent = '';
  flopRateUtilizationRelativeToRoofline = '';
  remarkText = '';
  remarkColor = '';
  flopsUtilizationTooltipMessage =
      'The first number shows the hardware utilization based on the hardware performance counter. The second one shows the performance compared to the program\'s optimal performance considering the instruction mix (i.e., the ratio of floating-point operations and memory operations).';

  ngOnChanges(changes: SimpleChanges) {
    if (!this.generalAnalysis || !this.inputPipelineAnalysis) {
      return;
    }

    this.isTpu = this.getInputPipelineProp('hardware_type', 'TPU') === 'TPU';

    if (this.isTpu) {
      this.parseTpuData();
    } else {
      this.parseGenericData();
    }
  }

  getInputPipelineProp(id: string, defaultValue: string = ''): string {
    const props = (this.inputPipelineAnalysis || {}).p || {};

    switch (id) {
      case 'hardware_type':
        return props.hardware_type || defaultValue;
      case 'other_time_ms_avg':
        return props.other_time_ms_avg || defaultValue;
      case 'other_time_ms_sdv':
        return props.other_time_ms_sdv || defaultValue;
      case 'compile_time_ms_avg':
        return props.compile_time_ms_avg || defaultValue;
      case 'compile_time_ms_sdv':
        return props.compile_time_ms_sdv || defaultValue;
      case 'outfeed_time_ms_avg':
        return props.outfeed_time_ms_avg || defaultValue;
      case 'outfeed_time_ms_sdv':
        return props.outfeed_time_ms_sdv || defaultValue;
      case 'infeed_time_ms_avg':
        return props.infeed_time_ms_avg || defaultValue;
      case 'infeed_time_ms_sdv':
        return props.infeed_time_ms_sdv || defaultValue;
      case 'kernel_launch_time_ms_avg':
        return props.kernel_launch_time_ms_avg || defaultValue;
      case 'kernel_launch_time_ms_sdv':
        return props.kernel_launch_time_ms_sdv || defaultValue;
      case 'host_compute_time_ms_avg':
        return props.host_compute_time_ms_avg || defaultValue;
      case 'host_compute_time_ms_sdv':
        return props.host_compute_time_ms_sdv || defaultValue;
      case 'device_to_device_time_ms_avg':
        return props.device_to_device_time_ms_avg || defaultValue;
      case 'device_to_device_time_ms_sdv':
        return props.device_to_device_time_ms_sdv || defaultValue;
      case 'device_compute_time_ms_avg':
        return props.device_compute_time_ms_avg || defaultValue;
      case 'device_compute_time_ms_sdv':
        return props.device_compute_time_ms_sdv || defaultValue;
      default:
        break;
    }

    return defaultValue;
  }

  parseTpuData() {
    const generalProps = (this.generalAnalysis || {}).p || {};
    const inputPipelineProps = (this.inputPipelineAnalysis || {}).p || {};

    this.mxuUtilizationPercent = generalProps.mxu_utilization_percent || '';
    this.flopRateUtilizationRelativeToRoofline =
        generalProps.flop_rate_utilization_relative_to_roofline || '';
    this.remarkText = generalProps.remark_text || '';
    this.remarkColor = generalProps.remark_color || '';

    this.summaryInfoBefore = [...this.firstSummaryInfo];
    this.summaryInfoAfter = [];

    if (this.propertyValues && this.propertyValues.length) {
      this.summaryInfoBefore.push({
        title: 'Average Step Time',
        descriptions: [
          'lower is better',
          `(σ = ${inputPipelineProps.steptime_ms_standard_deviation || ''} ms)`,
        ],
        value: `${inputPipelineProps.steptime_ms_average} ms`,
        propertyValues: [...(this.propertyValues || [])],
      });
    }

    this.summaryInfoBefore.push({
      title: 'Host Idle Time',
      descriptions: ['lower is better'],
      value: generalProps.host_idle_time_percent,
    });

    this.summaryInfoBefore.push({
      title: 'TPU Idle Time',
      descriptions: ['lower is better'],
      value: generalProps.device_idle_time_percent,
    });

    this.summaryInfoAfter.push({
      title: 'Memory Bandwidth Utilization',
      descriptions: ['higher is better'],
      value: generalProps.memory_bw_utilization_relative_to_hw_limit,
    });
  }

  parseGenericData() {
    const generalProps = (this.generalAnalysis || {}).p || {};
    const inputPipelineProps = (this.inputPipelineAnalysis || {}).p || {};

    this.remarkText = generalProps.remark_text || '';
    this.remarkColor = generalProps.remark_color || '';

    this.summaryInfoBefore = [];
    this.summaryInfoAfter = [];

    this.summaryInfoBefore.push({
      title: 'Average Step Time',
      descriptions: [
        'lower is better',
        `(σ = ${inputPipelineProps.steptime_ms_standard_deviation || ''} ms)`,
      ],
      value: `${inputPipelineProps.steptime_ms_average} ms`,
    });

    GENERIC_SUMMARY_INFO.forEach(info => {
      this.summaryInfoBefore.push({
        type: 'list',
        title: info.title,
        descriptions: [`(σ =  ${this.getInputPipelineProp(info.sdv)} ms)`],
        value: `${this.getInputPipelineProp(info.avg)} ms`,
      });
    });

    this.summaryInfoBefore.push({
      title: 'Device Compute Precisions',
      descriptions: ['out of Total Device Time'],
      propertyValues: [
        `16-bit: ${generalProps.device_compute_16bit_percent || ''}`,
        `32-bit: ${generalProps.device_compute_32bit_percent || ''}`,
      ],
    });
  }
}
