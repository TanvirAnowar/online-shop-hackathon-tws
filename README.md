# 🐳 CRUD App – Dockerized Deployment on AWS EC2

**Project:** Full-stack CRUD App (Frontend + Backend + Database)  
**Deployment:** Docker & Docker Compose on [Amazon Web Services](https://aws.amazon.com/) EC2  
**Live Domain:** [https://querygem.dpdns.org](https://querygem.dpdns.org)

---

## 📌 Overview

This project demonstrates a **complete Docker-based deployment** of a full-stack CRUD application, including:

- Frontend and backend combined in one containerized environment  
- MySQL database running in a private Docker network  
- Secure deployment on AWS EC2  
- Domain pointing with [DPDNS](https://dpdns.org/)  
- Minimal exposed ports for better security

---

## 🧰 Tech Stack

| Layer                 | Tool / Service                      |
|-----------------------|-------------------------------------|
| **Frontend + Backend** | React + Node.js (Dockerized)        |
| **Database**           | MySQL (Dockerized, internal only)   |
| **Containerization**   | Docker + Docker Compose             |
| **Hosting**            | AWS EC2 (Ubuntu)                    |
| **Domain Mapping**     | DPDNS custom domain                 |

---

## 🏗️ Architecture Diagram

```
                ┌───────────────────────┐
                │    Client Browser     │
                └──────────┬────────────┘
                           │  (HTTP)
                           ▼
                ┌─────────────────────────┐
                │    AWS EC2 Instance     │
                │  querygem.dpdns.org     │
                │  Port 80 (Public)       │
                └──────────┬──────────────┘
                           │
           ┌───────────────┼────────────────┐
           │                                │
           ▼                                ▼
 ┌────────────────┐               ┌────────────────┐
 │ Frontend + API │               │ MySQL Database │
 │ Single Service │──────────────▶│ Private        │
 │ Port 80        │ Internal Net  │ No Public Port │
 └────────────────┘               └────────────────┘
```

> ✅ Only port **80** is exposed publicly.  
> 🛡️ MySQL runs privately inside Docker network.

---

## 🪜 Deployment Steps

### 1. **Create and Access EC2 Instance**

```bash
chmod 400 hakathon-private-key.pem
ssh -i "hakathon-private-key.pem" ubuntu@<your-ec2-public-dns>
```

---

### 2. **Install Docker & Docker Compose**

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose-plugin
```

> Reconnect SSH after adding the user to the Docker group.

---

### 3. **Clone the Repository & Set Environment**

```bash
git clone https://github.com/TanvirAnowar/online-shop-hackathon-tws.git
cd online-shop-hackathon-tws
```

- Create a `.env` file with required environment variables.

---

### 4. **Configure Security Groups**

- Allow inbound:
  - **22** → SSH (your IP only)
  - **80** → Web access
- Block all other ports (e.g., MySQL 3306 stays private).

✅ MySQL stays inside Docker’s private network.

---

### 5. **Build & Run Containers**

```bash
docker compose up -d --build
sudo systemctl restart docker
```

---

### 6. **Initialize the Database**

```bash
docker exec -i -e MYSQL_PWD="supersecretrootXX123" db mysql -u root < db/init.sql
```

Check data:

```bash
docker exec -it db mysql -u root -p
SHOW DATABASES;
USE <your_database>;
SHOW TABLES;
```

---

### 7. **Domain Configuration**

- Point `querygem.dpdns.org` to EC2 public IP.  
- Add an **A record** in your DNS provider.  
- Access the app:

```
http://querygem.dpdns.org
```

---

## 📸 Screenshots

![Docker Compose Logs](https://via.placeholder.com/600x300?text=Docker+Compose+Logs)
![EC2 Security Group Port 80](https://via.placeholder.com/600x300?text=Security+Group+Port+80)
![React CRUD UI](https://via.placeholder.com/600x300?text=React+CRUD+App+Running)

---

## 🧠 Key Highlights

| Area                 | Implementation                        | Benefit                       |
|----------------------|---------------------------------------|-------------------------------|
| **Containerization** | Docker + Compose                      | Fast, consistent deployment   |
| **Security**         | Only port 80 exposed                  | Reduced attack surface        |
| **Automation**       | Single build command                  | Easy to manage                |
| **Domain Mapping**   | DPDNS to EC2                          | Clean public URL              |
| **Database Setup**   | `init.sql` + exec                     | Easy to replicate             |

---

## 🧰 Useful Commands

| Command | Description |
|---------|-------------|
| `docker ps` | Check running containers |
| `docker compose up -d --build` | Build and run containers |
| `docker compose down` | Stop and remove containers |
| `docker logs <container>` | Check logs |
| `docker exec -it <container> bash` | Access container shell |

---

## 🚀 Future Improvements

- Add CI/CD pipeline for automated deployment  
- Enable HTTPS with [Certbot](https://certbot.eff.org/) / [Let’s Encrypt](https://letsencrypt.org/)  
- Add monitoring and alerting  
- Optimize image size further

---

## 👤 Author

**Tanvir Anowar**  
DevOps & Automation Enthusiast  
🔗 [GitHub](https://github.com/TanvirAnowar)
