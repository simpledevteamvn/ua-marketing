export interface BidGroup {
  id: number; // chỉ tăng
  countries?: string[];
  bid?: number;
  goal?: number;
  baseBid?: number;
  maxBid?: number;
}

export interface BudgetGroupI {
  id: number;
  countries?: string[];
  /**
   * 4 field phía dưới được lưu qua form chứ ko cần lưu qua state
   * Riêng "countries" phải update qua state vì dính đến logic update countries
   * (Do việc dùng form sẽ có case lỗi do fetch data có lúc bị sai (vd: update countries cũ)).
   */
  // dailyBudget?: number;
  // totalBudget?: number;
  // dailyBudgetOpen?: boolean;
  // totalBudgetOpen?: boolean;
}
