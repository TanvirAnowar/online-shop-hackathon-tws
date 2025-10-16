# DevOps Hackathon — Dockerized CRUD Deployment (DevOps view)

Summary
- This repository contains a Dockerized deployment for a simple MySQL + Node (Express) API and a static React frontend served by a small Node static server.  
- Focus: infrastructure, repeatable builds, persistence, healthchecks and simple service-to-service networking — delivered as a Docker Compose stack suitable for EC2 deployment and pointing to the domain `querygem.dpdns.org`.

Quick architecture
- Services (docker-compose):
  - `db` — MySQL 8.3, named volume `db_data` for persistence, runs `db/init.sql` on first init.
  - `server` — Node/Express API, connects to `db` via Docker network.
  - `frontend` — built React app served on port 80; optionally proxies `/api` to `server` so only port 80 needs to be open externally.

Prerequisites (EC2)
- EC2 instance with outbound internet (or access to registries), Docker and Docker Compose installed.
- Security group: open TCP 80 (HTTP) and SSH (22) only. Do NOT open 3306 or 3000 publicly.
- Ensure `.env` in project root exists and is correct (see below).

Environment / secrets
- Fill `HackathonCrudProject/.env` (example values present). Important: do NOT commit `.env`.
  - Required keys:
    - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`
    - `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_HOST=db`, `PORT=3000`
  - Ensure `DB_USER` and `DB_PASSWORD` are explicit (do not rely on nested interpolation).

Persistent storage
- The MySQL data directory is persisted with a named volume `db_data` (declared in `docker-compose.yml`):
  - db => `/var/lib/mysql`
- Back up the volume (example from EC2 host):
  - docker run --rm -v db_data:/var/lib/mysql -v $(pwd)/backup:/backup alpine \
    sh -c "tar czf /backup/db_data.tar.gz -C /var/lib/mysql ."
- To destroy and recreate (WARNING: deletes data):
  - docker compose down -v
  - docker compose up -d --build

Database init (what runs and options)
- The repo includes `db/init.sql` — typical content creates `crud_operations` and `users` table.
- Official MySQL image executes `/docker-entrypoint-initdb.d/*.sql` only when the data directory is empty (first initialization). To force that execution you must remove the volume and recreate the stack (see above).
- If you must run `init.sql` against an existing database without removing the volume, run it manually inside the container.

Secure safe manual execution (recommended)
- From repo root on EC2:
  - Pull root password into a shell variable
    - MYSQL_ROOT_PASSWORD=$(grep -E '^MYSQL_ROOT_PASSWORD=' .env | cut -d'=' -f2-)
  - Create a temp protected client file, copy to container, run script, remove it:
    - cat > /tmp/mysql-client.conf <<EOF
      [client]
      user=root
      password=${MYSQL_ROOT_PASSWORD}
      EOF
    - chmod 600 /tmp/mysql-client.conf
    - docker cp /tmp/mysql-client.conf db:/tmp/mysql-client.conf
    - docker exec -i db mysql --defaults-extra-file=/tmp/mysql-client.conf < db/init.sql
    - docker exec db rm /tmp/mysql-client.conf || true
    - rm -f /tmp/mysql-client.conf
  - Quick alternative (shows warning about password on CLI):
  - docker exec -i db mysql -u root -p"$MYSQL_ROOT_PASSWORD" < db/init.sql

SQL snippet (table creation)
