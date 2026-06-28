package com.ems.security;

import com.ems.user.User;
import com.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Optional dependency on the employee lookup, injected lazily to avoid a hard compile-time
     * dependency from security -> employee module. Set via setter injection once the employee
     * module exists; until then employeeId on the principal is simply null.
     */
    private EmployeeIdLookup employeeIdLookup;

    public void setEmployeeIdLookup(EmployeeIdLookup employeeIdLookup) {
        this.employeeIdLookup = employeeIdLookup;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameOrEmail));

        CustomUserDetails details = new CustomUserDetails(user);

        if (employeeIdLookup != null) {
            Optional<Long> employeeId = employeeIdLookup.findEmployeeIdByUserId(user.getId());
            employeeId.ifPresent(details::setEmployeeId);
        }

        return details;
    }

    /**
     * Functional interface implemented by the employee module's repository,
     * so this service never needs a compile-time import of the Employee entity.
     */
    public interface EmployeeIdLookup {
        Optional<Long> findEmployeeIdByUserId(Long userId);
    }
}
