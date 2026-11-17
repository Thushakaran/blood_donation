package com.bloodshare.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({
            "/", "/about", "/contact", "/admin", "/login", "/register", "/need-blood", "/search", "/hospitals",
            "/dashboard", "/dashboard/**"
    })
    public String forwardToApp() {
        return "forward:/index.html";
    }
}
