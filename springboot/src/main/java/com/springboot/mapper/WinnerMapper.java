package com.springboot.mapper;

import com.springboot.pojo.Winner;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface WinnerMapper {

    // 插入新的玩家
    @Insert("INSERT INTO work.player(playerName, playerWinner) VALUES(#{playerName}, #{playerWinner})")
    void insert(Winner winner);

    // 获取所有玩家的获胜数据
    @Select("SELECT * FROM work.player order by work.player.playerWinner desc ")
    List<Winner> findAll();

    // 根据玩家名字查找玩家记录
    @Select("SELECT * FROM work.player WHERE playerName = #{playerName}")
    Winner findByPlayerName(String playerName);

    // 更新玩家的获胜次数
    @Update("UPDATE work.player SET playerWinner = #{playerWinner} WHERE playerName = #{playerName}")
    void updateWinner(Winner winner);


    // 查询分页数据
    @Select("SELECT * FROM work.player LIMIT #{offset}, #{size}")
    List<Winner> findWinnersByPage(@Param("offset") int offset, @Param("size") int size);

    // 查询总记录数
    @Select("SELECT COUNT(*) FROM work.player")
    int getTotalRecords();
}
