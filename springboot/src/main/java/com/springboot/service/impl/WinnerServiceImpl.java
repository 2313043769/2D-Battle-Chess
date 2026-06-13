package com.springboot.service.impl;

import com.springboot.mapper.WinnerMapper;
import com.springboot.pojo.Winner;
import com.springboot.service.WinnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WinnerServiceImpl implements WinnerService {

    @Autowired
    private WinnerMapper winnerMapper;

    // 获取所有获胜玩家数据
    @Override
    public List<Winner> findAll() {
        return winnerMapper.findAll();
    }

    // 添加新的玩家或更新现有玩家的获胜次数
    @Override
    public void add(Winner winner) {
        // 检查玩家是否已经存在
        Winner existingWinner = winnerMapper.findByPlayerName(winner.getPlayerName());
        if (existingWinner == null) {
            // 玩家不存在，插入新玩家，初始获胜次数为1
            winner.setPlayerWinner(1);
            winnerMapper.insert(winner);
        } else {
            // 玩家已经存在，更新获胜次数
            existingWinner.setPlayerWinner(existingWinner.getPlayerWinner() + 1);
            winnerMapper.updateWinner(existingWinner);
        }
    }
}
