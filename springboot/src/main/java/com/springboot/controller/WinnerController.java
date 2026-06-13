package com.springboot.controller;

import com.springboot.mapper.WinnerMapper;
import com.springboot.pojo.Result;
import com.springboot.pojo.Winner;
import com.springboot.service.WinnerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Slf4j
@CrossOrigin
@RestController
@RequestMapping("/winners")
public class WinnerController {

    @Autowired
    private WinnerService winnerService;

    // 获取排行榜列表
    @GetMapping
    public Result list() {
        log.info("查询排位");
        List<Winner> list = winnerService.findAll();
        return Result.success(list);
    }

    // 增加新的玩家或更新现有玩家的获胜次数
    @PostMapping
    public Result add(@RequestBody Winner winner) {
        log.info("新增/更新玩家：{}", winner);
        winnerService.add(winner);
        return Result.success();
    }
}
