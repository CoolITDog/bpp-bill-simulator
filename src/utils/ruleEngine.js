/**
 * 规则引擎：覆盖常见的BPP流程异常场景
 * 基于异常场景→根因的规则，用代码/配置文件实现
 */

// 规则库
const ruleLibrary = [
  {
    "id": "rule1",
    "scene": "field_value_error",
    "name": "字段值在节点流转后数值错误",
    "condition": [
      "异常字段的映射关系中，目标字段名与源字段名不一致",
      "源字段值正确，目标字段值异常"
    ],
    "rootCause": "数据映射时字段名配置错误",
    "codeCheckPoint": "src/flow/mapping.js:58",
    "suggestion": "核对异常节点的字段映射配置，确保目标字段名与源字段名一致",
    "confidence": 0.95
  },
  {
    "id": "rule2",
    "scene": "field_missing",
    "name": "缺少必填字段",
    "condition": [
      "表单数据中缺少流程引擎必需的字段",
      "该字段在代码中被标记为必填"
    ],
    "rootCause": "表单数据中缺少必填字段：processInstanceId",
    "codeCheckPoint": "src/flow/mapping.js:97",
    "suggestion": "检查表单提交逻辑，确保processInstanceId字段正确传递",
    "confidence": 0.90
  },
  {
    "id": "rule3",
    "scene": "field_type_error",
    "name": "字段类型错误",
    "condition": [
      "异常字段的类型配置与实际值类型不匹配",
      "源字段值是数字，目标字段类型是字符串"
    ],
    "rootCause": "字段类型配置错误，字符串类型转数字时默认值为0",
    "codeCheckPoint": "src/form/validate.js:163",
    "suggestion": "将异常字段的类型改为数字类型，重新提交",
    "confidence": 0.85
  },
  {
    "id": "rule4",
    "scene": "flow_not_progress",
    "name": "流程未正常流转",
    "condition": [
      "流程实例状态未改变",
      "表单数据已提交但流程未进入下一节点"
    ],
    "rootCause": "当前流程状态与表单数据中的状态不一致",
    "codeCheckPoint": "src/rule/RuleEngine.js:456",
    "suggestion": "检查流程状态流转逻辑，确保状态更新的原子性",
    "confidence": 0.80
  },
  {
    "id": "rule5",
    "scene": "node_config_error",
    "name": "节点配置错误",
    "condition": [
      "节点配置中的映射关系不存在",
      "目标字段在配置中定义但实际不存在"
    ],
    "rootCause": "节点配置中的映射关系错误",
    "codeCheckPoint": "src/flow/mapping.js:86",
    "suggestion": "检查节点配置中的映射关系，确保目标字段存在",
    "confidence": 0.85
  },
  {
    "id": "rule6",
    "scene": "field_value_0",
    "name": "表单提交后字段值显示为0",
    "condition": [
      "异常字段类型配置为文本类型",
      "用户输入的是数字值"
    ],
    "rootCause": "字段类型配置错误，文本类型转数字时默认值为0",
    "codeCheckPoint": "src/form/validate.js:163",
    "suggestion": "将异常字段的类型改为数字类型，重新提交",
    "confidence": 0.90
  },
  {
    "id": "rule7",
    "scene": "field_mapping_missing",
    "name": "字段映射关系缺失",
    "condition": [
      "异常字段在节点配置中没有映射关系",
      "源字段存在但未配置映射"
    ],
    "rootCause": "节点配置中缺少字段映射关系",
    "codeCheckPoint": "src/flow/mapping.js:86",
    "suggestion": "在节点配置中添加缺失的字段映射关系",
    "confidence": 0.85
  },
  {
    "id": "rule8",
    "scene": "process_status_error",
    "name": "流程状态错误",
    "condition": [
      "流程实例状态与预期不符",
      "流程已结束但仍在处理请求"
    ],
    "rootCause": "流程状态管理错误",
    "codeCheckPoint": "src/flow/flowService.js:128",
    "suggestion": "检查流程状态管理逻辑，确保状态更新正确",
    "confidence": 0.80
  }
];

/**
 * 规则引擎核心函数
 * @param {Object} exceptionData - 结构化的异常数据
 * @returns {Array} - 匹配的规则结果
 */
export const analyzeException = (exceptionData) => {
  if (!exceptionData || !exceptionData.exceptionScene) {
    return [];
  }
  
  // 获取匹配的规则
  const matchingRules = ruleLibrary.filter(rule => {
    return rule.scene === exceptionData.exceptionScene;
  });
  
  // 如果没有匹配的规则，返回空数组
  if (matchingRules.length === 0) {
    return [];
  }
  
  // 为每个匹配的规则生成分析结果
  const analysisResults = matchingRules.map(rule => {
    return {
      id: rule.id,
      type: rule.name,
      message: rule.rootCause,
      confidence: rule.confidence,
      location: rule.codeCheckPoint,
      suggestion: rule.suggestion,
      ruleId: rule.id,
      // 添加场景和仓库信息，便于后续扩展
      scene: exceptionData.exceptionScene,
      repoId: exceptionData.gitRepo
    };
  });
  
  return analysisResults;
};

/**
 * 获取规则详情
 * @param {string} ruleId - 规则ID
 * @returns {Object} - 规则详情
 */
export const getRuleById = (ruleId) => {
  return ruleLibrary.find(rule => rule.id === ruleId) || null;
};

/**
 * 获取所有规则
 * @returns {Array} - 所有规则
 */
export const getAllRules = () => {
  return [...ruleLibrary];
};

/**
 * 生成分析摘要
 * @param {Array} issues - 分析出的问题列表
 * @returns {string} - 分析摘要
 */
export const generateAnalysisSummary = (issues) => {
  if (!issues || issues.length === 0) {
    return "未发现匹配的异常规则，建议使用大模型进行进一步分析。";
  }
  
  const highConfidenceIssues = issues.filter(issue => issue.confidence > 0.9);
  const mediumConfidenceIssues = issues.filter(issue => issue.confidence > 0.7 && issue.confidence <= 0.9);
  const lowConfidenceIssues = issues.filter(issue => issue.confidence <= 0.7);
  
  let summary = `分析发现${issues.length}个潜在问题，`;
  
  if (highConfidenceIssues.length > 0) {
    summary += `其中${highConfidenceIssues.length}个高置信度问题，`;
  }
  
  if (mediumConfidenceIssues.length > 0) {
    summary += `${mediumConfidenceIssues.length}个中置信度问题，`;
  }
  
  if (lowConfidenceIssues.length > 0) {
    summary += `${lowConfidenceIssues.length}个低置信度问题，`;
  }
  
  summary = summary.slice(0, -1) + "。";
  
  // 添加建议
  summary += " 建议优先检查";
  
  const topIssues = issues.slice(0, 2).map(issue => issue.type).join("和");
  summary += ` ${topIssues}，`;
  
  summary += "按照建议进行修复，并验证修复效果。";
  
  return summary;
};

/**
 * 生成严重程度
 * @param {Array} issues - 分析出的问题列表
 * @returns {string} - 严重程度
 */
export const generateSeverity = (issues) => {
  if (!issues || issues.length === 0) {
    return "low";
  }
  
  const highConfidenceCount = issues.filter(issue => issue.confidence > 0.9).length;
  const totalIssues = issues.length;
  
  if (highConfidenceCount > 0 || totalIssues > 2) {
    return "high";
  } else if (totalIssues > 0) {
    return "medium";
  } else {
    return "low";
  }
};