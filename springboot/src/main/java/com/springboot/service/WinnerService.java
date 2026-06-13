package com.springboot.service;

import com.springboot.pojo.Winner;

import java.util.List;

public interface WinnerService {
    List<Winner> findAll();

    void add(Winner winner);
}
