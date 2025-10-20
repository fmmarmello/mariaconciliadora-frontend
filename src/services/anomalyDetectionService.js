import { get, post, put, ApiError } from './apiService';

class AnomalyDetectionService {
  /**
   * Process reconciliation with anomaly detection
   * @param {Object} params - Parameters for anomaly detection
   * @param {string} params.start_date - Start date for reconciliation
   * @param {string} params.end_date - End date for reconciliation
   * @param {number} params.user_id - User ID (optional)
   * @returns {Promise<Object>} - Anomaly detection results
   */
  async processReconciliationWithAnomalyDetection(params = {}) {
    try {
      const data = await post('/reconciliation/anomaly-detection', params);
      return data;
    } catch (error) {
      console.error('Error processing reconciliation with anomaly detection:', error);
      throw error;
    }
  }

  /**
   * Get anomalous reconciliations with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of records to return
   * @param {number} params.offset - Offset for pagination
   * @param {string} params.severity - Filter by severity (low, medium, high, critical)
   * @param {string} params.status - Filter by status (pending, resolved)
   * @returns {Promise<Object>} - Paginated anomalous reconciliations
   */
  async getAnomalousReconciliations(params = {}) {
    try {
      const data = await get('/reconciliation/anomalies', params);
      return data;
    } catch (error) {
      console.error('Error getting anomalous reconciliations:', error);
      throw error;
    }
  }

  /**
   * Review and resolve an anomaly
   * @param {number} reconciliationId - ID of the reconciliation record
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.user_id - User ID performing the review
   * @param {string} reviewData.action - Action (confirmed, dismissed, escalated)
   * @param {string} reviewData.justification - Justification for the action
   * @returns {Promise<Object>} - Review result
   */
  async reviewAnomaly(reconciliationId, reviewData) {
    try {
      const data = await post(`/reconciliation/anomaly/${reconciliationId}/review`, reviewData);
      return data;
    } catch (error) {
      console.error('Error reviewing anomaly:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered workflow suggestions for anomaly resolution
   * @param {number} reconciliationId - ID of the reconciliation record
   * @returns {Promise<Object>} - Workflow suggestions
   */
  async getAnomalyWorkflowSuggestions(reconciliationId) {
    try {
      const data = await get(`/reconciliation/anomaly/${reconciliationId}/suggestions`);
      return data;
    } catch (error) {
      console.error('Error getting anomaly workflow suggestions:', error);
      throw error;
    }
  }

  /**
   * Escalate an anomaly to higher authority
   * @param {number} reconciliationId - ID of the reconciliation record
   * @param {Object} escalationData - Escalation data
   * @param {number} escalationData.user_id - User ID escalating
   * @param {string} escalationData.escalation_reason - Reason for escalation
   * @param {number} escalationData.target_user_id - Target user ID (optional)
   * @returns {Promise<Object>} - Escalation result
   */
  async escalateAnomaly(reconciliationId, escalationData) {
    try {
      const data = await post(`/reconciliation/anomaly/${reconciliationId}/escalate`, escalationData);
      return data;
    } catch (error) {
      console.error('Error escalating anomaly:', error);
      throw error;
    }
  }

  /**
   * Review multiple anomalies in batch
   * @param {Object} batchData - Batch review data
   * @param {number[]} batchData.reconciliation_ids - Array of reconciliation IDs
   * @param {number} batchData.user_id - User ID performing the review
   * @param {string} batchData.action - Action (confirmed, dismissed, escalated)
   * @param {string} batchData.justification - Justification for the action
   * @returns {Promise<Object>} - Batch review result
   */
  async bulkAnomalyReview(batchData) {
    try {
      const data = await post('/reconciliation/anomaly/batch-review', batchData);
      return data;
    } catch (error) {
      console.error('Error in bulk anomaly review:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive anomaly statistics
   * @returns {Promise<Object>} - Anomaly statistics
   */
  async getAnomalyStatistics() {
    try {
      const data = await get('/reconciliation/anomaly/statistics');
      return data;
    } catch (error) {
      console.error('Error getting anomaly statistics:', error);
      throw error;
    }
  }

  /**
   * Get anomaly severity color for UI
   * @param {string} severity - Severity level
   * @returns {string} - Tailwind color class
   */
  getSeverityColor(severity) {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get anomaly status color for UI
   * @param {string} status - Status (pending, resolved)
   * @returns {string} - Tailwind color class
   */
  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get anomaly type icon
   * @param {string} type - Anomaly type
   * @returns {string} - Icon name or component
   */
  getAnomalyIcon(type) {
    switch (type?.toLowerCase()) {
      case 'amount_mismatch':
        return 'DollarSign';
      case 'date_discrepancy':
        return 'Calendar';
      case 'description_mismatch':
        return 'FileText';
      case 'category_conflict':
        return 'Tag';
      case 'risk_pattern':
        return 'AlertTriangle';
      case 'duplicate_detection':
        return 'Copy';
      default:
        return 'AlertTriangle';
    }
  }

  /**
   * Format anomaly score for display
   * @param {number} score - Anomaly score (0-1)
   * @returns {string} - Formatted score
   */
  formatAnomalyScore(score) {
    if (typeof score !== 'number') return 'N/A';
    return `${Math.round(score * 100)}%`;
  }

  /**
   * Get severity level text in Portuguese
   * @param {string} severity - Severity level
   * @returns {string} - Portuguese text
   */
  getSeverityText(severity) {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'Baixo';
      case 'medium':
        return 'Médio';
      case 'high':
        return 'Alto';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconhecido';
    }
  }

  /**
   * Get anomaly type text in Portuguese
   * @param {string} type - Anomaly type
   * @returns {string} - Portuguese text
   */
  getAnomalyTypeText(type) {
    switch (type?.toLowerCase()) {
      case 'amount_mismatch':
        return 'Incompatibilidade de Valor';
      case 'date_discrepancy':
        return 'Discrepância de Data';
      case 'description_mismatch':
        return 'Incompatibilidade de Descrição';
      case 'category_conflict':
        return 'Conflito de Categoria';
      case 'risk_pattern':
        return 'Padrão de Risco';
      case 'duplicate_detection':
        return 'Detecção de Duplicata';
      default:
        return 'Desconhecido';
    }
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();
export default anomalyDetectionService;