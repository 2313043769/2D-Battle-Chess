package com.springboot.pojo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Winner {
    private Integer playerId;
    private String playerName;
    private Integer playerWinner;
}
