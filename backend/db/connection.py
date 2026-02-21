from contextlib import contextmanager

import psycopg2
from psycopg2.pool import SimpleConnectionPool

from config import DATABASE_URL

_pool: SimpleConnectionPool | None = None


def get_pool() -> SimpleConnectionPool:
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(minconn=1, maxconn=5, dsn=DATABASE_URL)
    return _pool


@contextmanager
def db_conn():
    """Yield a connection that auto-commits on success and returns to pool on exit."""
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)
