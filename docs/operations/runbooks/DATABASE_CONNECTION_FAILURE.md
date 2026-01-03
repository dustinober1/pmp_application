# Database Connection Failure - Runbook

## Alert Information

- **Alert Name**: DatabaseConnectionFailure
- **Severity**: P1 Critical
- **Response Time**: Within 5 minutes
- **Threshold**: Deadlocks > 10 OR Conflicts > 50

## Summary

Database is experiencing connection failures, deadlocks, or conflicts. This prevents services from functioning and requires immediate investigation.

## Impact

- All backend services unable to connect to database
- Application completely non-functional
- Potential data corruption if locks persist
- Active transactions may be blocked

## Initial Diagnosis (First 5 Minutes)

### 1. Acknowledge Alert

```bash
# PagerDuty
Acknowledge and add note: "Investigating database connection failures"

# Slack #ops-alerts
👋 Acknowledged - investigating database connection failures for {{ $labels.datname }}
```

### 2. Check Database Status

```bash
# Check PostgreSQL pod
kubectl get pods -n production -l app=postgres

# Check if PostgreSQL is running
kubectl exec -it <postgres-pod> -n production -- pg_isready

# Check PostgreSQL status
kubectl exec -it <postgres-pod> -n production -- psql -c "SELECT version();"
```

### 3. Determine Database State

- **Completely down**: All connections failing
- **Degraded**: Some connections succeed
- **Locked**: Connections accepted but queries blocked
- **Exhausted**: Connection pool full

### 4. Check Dashboards

- **Database Metrics**: https://grafana.pmpstudy.com/d/database-metrics
- Look for: Connection spikes, lock counts, query duration

## Investigation Steps (First 15 Minutes)

### Check 1: Database Connection Count

```bash
# Check current connections
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT count(*), state
  FROM pg_stat_activity
  GROUP BY state;
"

# Check max connections setting
kubectl exec -it <postgres-pod> -n production -- psql -c "SHOW max_connections;"

# Check connection limit
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT max_conn, used, res_for_super, max_conn-used-res_for_super
  FROM (
    SELECT setting::int AS max_conn,
           (SELECT count(*) FROM pg_stat_activity) AS used,
           setting::int-(SELECT count(*) FROM pg_stat_activity) AS res_for_super
  ) settings;
"
```

### Check 2: Long-Running Queries

```bash
# Find queries running longer than 5 minutes
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pid,
         now() - pg_stat_activity.query_start AS duration,
         query,
         state
  FROM pg_stat_activity
  WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  ORDER BY duration DESC;
"

# Check for idle transactions
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pid,
         now() - xact_start AS duration,
         query
  FROM pg_stat_activity
  WHERE state IN ('idle in transaction', 'active')
  ORDER BY duration DESC;
"
```

### Check 3: Locks and Deadlocks

```bash
# Check current locks
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT t.relname,
         l.locktype,
         l.mode,
         l.granted,
         a.usename,
         a.query,
         a.query_start
  FROM pg_locks l
  JOIN pg_stat_activity a ON l.pid = a.pid
  JOIN pg_class t ON l.relation = t.oid
  WHERE NOT l.granted
  ORDER BY a.query_start;
"

# Check deadlocks
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT * FROM pg_stat_database_conflicts;
"

# Check for table locks
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT l.locktype,
         l.database,
         l.relation,
         l.mode,
         l.granted,
         a.usename,
         a.query,
         a.query_start
  FROM pg_locks l
  LEFT JOIN pg_stat_activity a ON l.pid = a.pid
  WHERE l.relation IS NOT NULL
  ORDER BY l.granted, a.query_start;
"
```

### Check 4: Database Resources

```bash
# Check database size
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pg_database.datname,
         pg_size_pretty(pg_database_size(pg_database.datname)) AS size
  FROM pg_database
  ORDER BY pg_database_size(pg_database.datname) DESC;
"

# Check table sizes
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT schemaname,
         tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 10;
"

# Check disk space
kubectl exec -it <postgres-pod> -n production -- df -h /var/lib/postgresql/data
```

### Check 5: Error Logs

```bash
# View PostgreSQL logs
kubectl logs <postgres-pod> -n production --tail=1000 | grep -i error

# Look for connection errors
kubectl logs <postgres-pod> -n production --tail=1000 | grep -i "connection\|fatal\|failed"

# Check for OOM errors
kubectl describe pod <postgres-pod> -n production | grep -i oom

# Check system logs
kubectl logs <postgres-pod> -n production --tail=500
```

### Check 6: Network Issues

```bash
# Test network from application pod
kubectl exec -it <app-pod> -n production -- \
  telnet <postgres-service> 5432

# Check DNS resolution
kubectl exec -it <app-pod> -n production -- \
  nslookup <postgres-service>.production.svc.cluster.local

# Check service endpoints
kubectl get endpoints postgres -n production

# Check network policies
kubectl get networkpolicies -n production
```

### Check 7: Connection Pool Settings

```bash
# Check application connection pool
kubectl get deployment <service> -n production -o jsonpath='{.spec.template.spec.containers[0].env}' | \
  jq '.[] | select(.name | contains("DATABASE")) | .name, .value'

# Common pool settings to check:
# - DATABASE_POOL_SIZE
# - DATABASE_CONNECTION_TIMEOUT
# - DATABASE_IDLE_TIMEOUT
```

## Resolution Strategies

### Strategy 1: Kill Long-Running Queries

```bash
# List long-running queries
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pid,
         now() - query_start AS duration,
         query
  FROM pg_stat_activity
  WHERE state = 'active'
  AND (now() - query_start) > interval '5 minutes'
  ORDER BY duration DESC;
"

# Terminate specific query (be careful!)
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pg_terminate_backend(<pid>);
"

# Terminate all long-running queries
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'active'
  AND (now() - query_start) > interval '10 minutes'
  AND pid != pg_backend_pid();
"
```

### Strategy 2: Kill Idle Transactions

```bash
# Find idle in transaction
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pid,
         now() - xact_start AS duration,
         query
  FROM pg_stat_activity
  WHERE state IN ('idle in transaction')
  ORDER BY duration DESC;
"

# Kill idle transactions older than 5 minutes
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle in transaction'
  AND (now() - xact_start) > interval '5 minutes';
"
```

### Strategy 3: Restart PostgreSQL (Last Resort)

```bash
# WARNING: This causes downtime!

# Scale down application first
kubectl scale deployment <service> --replicas=0 -n production

# Restart PostgreSQL pod
kubectl delete pod <postgres-pod> -n production

# Wait for new pod to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n production --timeout=120s

# Scale up application
kubectl scale deployment <service> --replicas=3 -n production
```

### Strategy 4: Increase Connection Limits

```bash
# Edit ConfigMap to increase max_connections
kubectl edit configmap postgres-config -n production

# Update max_connections (requires restart)
# max_connections = 200 (default is usually 100)

# Or update using ALTER SYSTEM
kubectl exec -it <postgres-pod> -n production -- psql -c "
  ALTER SYSTEM SET max_connections = 200;
  SELECT pg_reload_conf();
"
```

### Strategy 5: Fix Application Connection Pool

```bash
# Edit deployment to adjust pool size
kubectl edit deployment <service> -n production

# Update environment variables:
env:
  - name: DATABASE_POOL_SIZE
    value: "20"  # Increase from default
  - name: DATABASE_CONNECTION_TIMEOUT
    value: "30000"  # 30 seconds
  - name: DATABASE_IDLE_TIMEOUT
    value: "10000"  # 10 seconds

# Rollout restart
kubectl rollout restart deployment <service> -n production
```

### Strategy 6: Resolve Locks

```bash
# Identify blocking locks
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocked_activity.usename AS blocked_user,
         blocking_locks.pid AS blocking_pid,
         blocking_activity.usename AS blocking_user,
         blocked_activity.query AS blocked_statement,
         blocking_activity.query AS blocking_statement
  FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks
        ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
  WHERE NOT blocked_locks.GRANTED;
"

# Kill blocking session (careful!)
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT pg_terminate_backend(<blocking_pid>);
"
```

### Strategy 7: Failover to Replica (If Available)

```bash
# Check replica status
kubectl exec -it <postgres-replica-pod> -n production -- psql -c "
  SELECT pg_is_in_recovery();
"

# Promote replica to primary
kubectl exec -it <postgres-replica-pod> -n production -- pg_promote

# Update application connection string
kubectl edit deployment <service> -n production
# Update DATABASE_URL to point to new primary

# Or update service selector
kubectl edit service postgres -n production
```

## After Resolution (Next 30 Minutes)

### 1. Verify Database Health

```bash
# Check connection count is normal
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT count(*) FROM pg_stat_activity;
"

# Check no long-running queries
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT count(*)
  FROM pg_stat_activity
  WHERE state = 'active'
  AND (now() - query_start) > interval '5 minutes';
"

# Check for locks
kubectl exec -it <postgres-pod> -n production -- psql -c "
  SELECT count(*) FROM pg_locks WHERE NOT granted;
"
```

### 2. Monitor Metrics

- **Grafana Database Dashboard**: https://grafana.pmpstudy.com/d/database-metrics
- Watch: Connection count, query duration, locks
- **Duration**: 30 minutes

### 3. Check Application Logs

```bash
# Verify application can connect
kubectl logs <app-pod> -n production --tail=100 | grep -i database

# Check for errors
kubectl logs <app-pod> -n production --tail=100 | grep -i error
```

### 4. Update Status

```bash
# PagerDuty
Resolve and add note: "Killed long-running queries, database connections normalized"

# Slack
✅ Resolved - Database connection failures resolved, killed 3 long-running queries
```

## Prevention & Follow-Up

### Immediate Prevention

- [ ] Set up connection pool monitoring
- [ ] Add slow query log
- [ ] Create alert for long-running queries

### Short-Term Prevention (1-2 Days)

- [ ] Optimize slow queries (use EXPLAIN ANALYZE)
- [ ] Add indexes to frequently queried tables
- [ ] Implement query timeout in application
- [ ] Review connection pool settings
- [ ] Add database vacuum schedule

### Long-Term Prevention (Next Sprint)

- [ ] Implement read replicas for query offloading
- [ ] Add connection pooler (PgBouncer)
- [ ] Implement automatic query termination
- [ ] Set up automated failover
- [ ] Improve database capacity planning
- [ ] Add performance testing for queries

## Optimization Queries

### Find Slow Queries

```sql
SELECT query,
       calls,
       total_exec_time,
       mean_exec_time,
       max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Find Missing Indexes

```sql
SELECT schemaname,
       tablename,
       attname,
       n_distinct,
       correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC
LIMIT 20;
```

### Find Large Tables

```sql
SELECT schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Escalation

- **If**: Database down > 10 minutes
- **To**: Engineering Lead, CTO
- **Reason**: Critical service, potential data loss

## Related Runbooks

- [Database Down](./DATABASE_DOWN.md)
- [High Memory Usage](./HIGH_MEMORY_USAGE.md)
- [Slow Queries](./SLOW_QUERIES.md)

---

**Last Updated**: 2025-01-01
**Maintained By**: Backend Team
**Questions?**: backend@pmpstudy.com
