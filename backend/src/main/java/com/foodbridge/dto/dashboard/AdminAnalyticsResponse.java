package com.foodbridge.dto.dashboard;

import java.util.Map;

public class AdminAnalyticsResponse {

    private ImpactStatsResponse impactStats;
    private Map<String, Long> categoryBreakdown;
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> cityBreakdown;
    private Map<String, Long> monthlyTrend;
    private long pendingNgoCount;
    private long totalUsers;

    public AdminAnalyticsResponse() {
    }

    public ImpactStatsResponse getImpactStats() {
        return impactStats;
    }

    public void setImpactStats(ImpactStatsResponse impactStats) {
        this.impactStats = impactStats;
    }

    public Map<String, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<String, Long> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(Map<String, Long> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public Map<String, Long> getCityBreakdown() {
        return cityBreakdown;
    }

    public void setCityBreakdown(Map<String, Long> cityBreakdown) {
        this.cityBreakdown = cityBreakdown;
    }

    public Map<String, Long> getMonthlyTrend() {
        return monthlyTrend;
    }

    public void setMonthlyTrend(Map<String, Long> monthlyTrend) {
        this.monthlyTrend = monthlyTrend;
    }

    public long getPendingNgoCount() {
        return pendingNgoCount;
    }

    public void setPendingNgoCount(long pendingNgoCount) {
        this.pendingNgoCount = pendingNgoCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }
}
