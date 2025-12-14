package org.example.dtos;

import lombok.Data;

@Data
public class Result {
    private String status;
    private Object data;
    private Object error;

    // Mimics your createResult(err, data) function
    public Result(Object err, Object data) {
        if (data != null) {
            this.status = "success";
            this.data = data;
            this.error = null;
        } else {
            this.status = "error";
            this.error = err;
            this.data = null;
        }
    }
}