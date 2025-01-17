package com.github.wekaito.backend.security;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
class MongoUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAnonymousUser_whenGetUserName() throws Exception {
        // GIVEN that user is not logged in
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/me"))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("anonymousUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void getUsername_whenLoggedInGetUserName() throws Exception {
        // GIVEN that user is logged in
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("testUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void getUserName_whenLogin() throws Exception {
        // GIVEN that user is logged in
        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()))
                // THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("testUser"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectNoContent_whenLogoutUser() throws Exception {
        //GIVEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login").with(csrf()));
        //WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/logout").with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    void expectRegistration_whenRegisterUser() throws Exception {
        //GIVEN
        String testUserWithoutId = """
                    {
                        "username": "newTestUser",
                        "password": "secretPass3"
                    }
                """;

        //WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testUserWithoutId)
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Successfully registered!"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectActiveDeck_AfterSetActiveDeck() throws Exception {

        String testUserWithoutId = """
                {
                    "username": "testUser",
                    "password": "testPassWord1"
                }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/active-deck/12345")
                .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/active-deck")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("12345"));
    }

    @Test
    @WithMockUser(username = "testUser", password = "testPassword")
    void expectTestAvatar_AfterSetAvatar() throws Exception {

        String testUserWithoutId = """
                {
                    "username": "testUser",
                    "password": "testPassWord1"
                }
            """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(testUserWithoutId)
                .with(csrf())).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
                .with(csrf())
        ).andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/user/avatar/test")
                        .with(csrf()))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/user/avatar")
                        .with(csrf()))
                //THEN
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("test"));
    }
}
