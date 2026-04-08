/**
 * ghnUtils.js
 * Utility functions để xử lý response từ GHN API
 * Đã được tối ưu để parse đúng response chuẩn của GHN
 */

console.log("🚀 ghnUtils.js loaded");

/**
 * Xử lý response từ GHN API - Phiên bản linh hoạt
 * @param {Object|Array} responseData - Dữ liệu trả về từ axios
 * @returns {Array} - Mảng dữ liệu (districts hoặc wards)
 */
export const parseGHNResponse = (responseData) => {
  console.log('🔍 Parsing GHN response:', responseData);

  if (!responseData) {
    console.error('❌ Response data is null/undefined');
    return [];
  }

  // Trường hợp 1: Response là array trực tiếp
  if (Array.isArray(responseData)) {
    console.log('✅ Response is direct array');
    return responseData;
  }

  // Trường hợp 2: Response chuẩn của GHN { code: 200, message: "...", data: [...] }
  if (responseData.code === 200 && responseData.data !== undefined) {
    if (Array.isArray(responseData.data)) {
      console.log('✅ Parsed successfully - using response.data (standard GHN format)');
      return responseData.data;
    } else {
      console.warn('⚠️ "data" field exists but is not an array:', typeof responseData.data);
      return [];
    }
  }

  // Trường hợp 3: Response chỉ có field "data" và là array
  if (responseData.data && Array.isArray(responseData.data)) {
    console.log('✅ Parsed using response.data (fallback)');
    return responseData.data;
  }

  // Trường hợp 4: Tìm array trong object (phòng trường hợp response lạ)
  if (typeof responseData === 'object' && responseData !== null) {
    const values = Object.values(responseData);
    for (const value of values) {
      if (Array.isArray(value)) {
        console.log('✅ Found array inside response object');
        return value;
      }
    }
  }

  // Nếu không parse được
  console.error('❌ Unknown response format:', responseData);
  console.log('   Available keys:', Object.keys(responseData));

  return [];
};

/**
 * Kiểm tra response có thành công không
 * @param {Object|Array} responseData 
 * @returns {boolean}
 */
export const isGHNResponseSuccess = (responseData) => {
  if (!responseData) return false;

  if (Array.isArray(responseData)) return true;

  // GHN chuẩn
  if (responseData.code === 200) return true;

  // Một số trường hợp chỉ có data
  if (responseData.data && Array.isArray(responseData.data)) return true;

  return false;
};

/**
 * Lấy thông báo lỗi từ response
 * @param {Object} responseData 
 * @returns {string}
 */
export const getGHNErrorMessage = (responseData) => {
  if (!responseData) return 'Không nhận được phản hồi từ server';

  if (responseData.message) return responseData.message;
  if (responseData.error) return responseData.error;
  if (responseData.description) return responseData.description;

  return 'Đã xảy ra lỗi khi gọi GHN API';
};

/**
 * Log chi tiết response để debug (rất hữu ích)
 * @param {string} endpoint - Tên endpoint (ví dụ: provinces, districts, wards)
 * @param {Object} responseData 
 */
export const logGHNResponse = (endpoint, responseData) => {
  console.group(`📊 GHN API Response for ${endpoint}`);
  console.log('Raw data:', responseData);
  console.log('Type:', typeof responseData);
  console.log('Is Array:', Array.isArray(responseData));

  if (responseData && typeof responseData === 'object') {
    console.log('Keys:', Object.keys(responseData));

    if (responseData.code !== undefined) {
      console.log('Code:', responseData.code);
    }
    if (responseData.message) {
      console.log('Message:', responseData.message);
    }
    if (responseData.data) {
      console.log('Data type:', typeof responseData.data);
      console.log('Data is array:', Array.isArray(responseData.data));
    }
  }
  console.groupEnd();
};

export default {
  parseGHNResponse,
  isGHNResponseSuccess,
  getGHNErrorMessage,
  logGHNResponse
};