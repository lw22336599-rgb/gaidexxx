import {TG_ValidityPeriodType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_ValidityPeriodType";
import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {HolidayType} from "@/TsModel/Alien/Entity/Enums/HolidayType";
import {TG_PrivateRoomUsageType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_PrivateRoomUsageType";
import {TG_DailyAvailabilityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_DailyAvailabilityType";
import {TG_DailyTimeSlot} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_DailyTimeSlot";
import {TG_VoucherVerificationRule} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_VoucherVerificationRule";
import {TG_DiningOption} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_DiningOption";
import {TG_PackagingFeeType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_PackagingFeeType";
import {TG_ReservationRule} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_ReservationRule";
import {TG_BookingCancellationRule} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_BookingCancellationRule";
import {HourMinute} from "@/TsModel/Alien/Entity/Function/ZDTG/HourMinute";
import {TG_UsageLimitType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_UsageLimitType";
import {TG_OtherDiscountCompatibility} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_OtherDiscountCompatibility";

/** 团购商品使用规则*/
export interface TG_UseRuleConf {
		/** 卷有效期-有效期类型*/
		ValidityPeriodType?: TG_ValidityPeriodType | null;
		/** 卷有效期-指定天数(购买当日默认有效)*/
		ValidityDays?: number | null;
		/** 卷有效期-指定日期段(仅一个开始时间和结束时间)*/
		ValidityDateRange?: DateTimeScope | null;
		/** 不可用的星期几列表*/
		UnavailableWeekdays?: DayType[] | null;
		/** 节假日不可用*/
		UnavailableHolidays?: HolidayType[] | null;
		/** 指定不可用日期段列表*/
		UnavailableDateRanges?: DateTimeScope[] | null;
		/** 包间使用类型*/
		PrivateRoomUsageType?: TG_PrivateRoomUsageType | null;
		/** 每日可用券时段类型*/
		DailyAvailabilityType?: TG_DailyAvailabilityType | null;
		/** 部分时间可用时的时段列表*/
		DailyAvailableTimeSlots?: TG_DailyTimeSlot[] | null;
		/** 验券规则*/
		VoucherVerificationRule?: TG_VoucherVerificationRule | null;
		/** 是否支持配送*/
		SupportsDelivery?: boolean | null;
		/** 是否支持在线预约自提*/
		SupportsOnlineReservationPickup?: boolean | null;
		/** 堂食自提约定(可多选)*/
		DiningOptions?: TG_DiningOption | null;
		/** 餐前外带打包费类型*/
		PackagingFeeType?: TG_PackagingFeeType | null;
		/** 总共收取的打包费(元)*/
		TotalPackagingFee?: number | null;
		/** 每个打包盒收取的费用(元)*/
		PerBoxPackagingFee?: number | null;
		/** 预约规则*/
		ReservationRule?: TG_ReservationRule | null;
		/** 需电话预约时的预约规则说明,如提前一天预约*/
		PhoneReservationRuleDetail?: string | null;
		/** 预订套餐取消规则(与订座规则绑定时必填)*/
		BookingCancellationRule?: TG_BookingCancellationRule | null;
		/** 取消需提前天数(0-7),支持取消按期限时必填*/
		CancellationDaysBeforeArrival?: number | null;
		/** 取消截止时间(到店前X天此时间前可无责取消),支持取消按期限时必填*/
		CancellationDeadlineTime?: HourMinute | null;
		/** 限用类型*/
		UsageLimitType?: TG_UsageLimitType | null;
		/** 每人限用张数*/
		PerPersonLimit?: number | null;
		/** 每桌限用张数*/
		PerTableLimit?: number | null;
		/** 店内其他优惠兼容性*/
		OtherDiscountCompatibility?: TG_OtherDiscountCompatibility | null;
		/** 其他补充说明*/
		AdditionalNotes?: string | null;
}
