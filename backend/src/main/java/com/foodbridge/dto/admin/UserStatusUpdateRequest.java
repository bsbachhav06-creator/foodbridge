package com.foodbridge.dto.admin;

public class UserStatusUpdateRequest {

    private boolean active;

    public UserStatusUpdateRequest() {
    }

    public UserStatusUpdateRequest(boolean active) {
        this.active = active;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
