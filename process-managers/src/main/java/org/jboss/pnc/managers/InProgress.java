/**
 * JBoss, Home of Professional Open Source.
 * Copyright 2014 Red Hat, Inc., and individual contributors
 * as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jboss.pnc.managers;

import org.jboss.util.collection.ConcurrentSet;

import javax.enterprise.context.ApplicationScoped;
import java.util.Collections;
import java.util.Set;

/**
 * @author <a href="mailto:matejonnet@gmail.com">Matej Lazar</a>
 */
@ApplicationScoped
public class InProgress {
    private Set<Integer> inProgress = new ConcurrentSet<>();

    public boolean add(Integer id) {
        return inProgress.add(id);
    }

    public boolean remove(Integer id) {
        return inProgress.remove(id);
    }

    public Set<Integer> getAll() {
        return Collections.unmodifiableSet(inProgress);
    }
}